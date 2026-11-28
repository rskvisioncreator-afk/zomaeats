/**
 * Downloads the demo food photos into public/images.
 * Run: node scripts/fetch-images.mjs
 * Photos: Unsplash (Unsplash License) + Wikimedia Commons photos
 * (chefs: public domain / CC BY-SA 4.0 by Sunnya343; pani puri: CC0).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'images')

const photos = {
  biryani: 'photo-1563379091339-03b21ab4a4f8',
  'biryani-2': 'photo-1589302168068-964664d93dc0',
  burger: 'photo-1568901346375-23c9450c58cd',
  'burger-2': 'photo-1550547660-d9450f859349',
  pizza: 'photo-1513104890138-7c749659a591',
  'pizza-2': 'photo-1565299624946-b28f40a0ae38',
  curry: 'photo-1585937421612-70a008356fbe',
  'butter-chicken': 'photo-1603894584373-5ac82b2ae398',
  dosa: 'photo-1668236543090-82eba5ee5976',
  idli: 'photo-1589301760014-d929f3979dbc',
  noodles: 'photo-1585032226651-759b368d7246',
  momos: 'photo-1534422298391-e4f8c172dddb',
  sushi: 'photo-1579871494447-9811cf80d66c',
  salad: 'photo-1512621776951-a57141f2eefd',
  cake: 'photo-1578985545062-69928b1d9587',
  brownie: 'photo-1606313564200-e75d5e30476c',
  coffee: 'photo-1509042239860-f550ce710b93',
  'coffee-2': 'photo-1461023058943-07fcbe16d735',
  kebab: 'photo-1603360946369-dc9bb6258143',
  grilled: 'photo-1544025162-d76694265947',
  fish: 'photo-1519708227418-c8fd9a32b7a2',
  sandwich: 'photo-1528735602780-2552fd46c7af',
  fries: 'photo-1573080496219-bb080dd4f877',
  pasta: 'photo-1621996346565-e3dbc646d9a9',
  paneer: 'photo-1631452180519-c014fe946bc7',
  'paneer-tikka': 'photo-1567188040759-fb8a883dc6d8',
  thali: 'photo-1546833999-b9f581a1996d',
  rolls: 'photo-1626700051175-6818013e1d4f',
  waffle: 'photo-1562376552-0d160a2f238d',
  pancakes: 'photo-1528207776546-365bb710ee93',
  chai: 'photo-1571934811356-5cc061b6821f',
  restaurant: 'photo-1517248135467-4c7edcad34c4',
}

const query = '?auto=format&fit=crop&w=1200&q=80'

// Indian chefs for the hero headline. Indian Chef is public domain (USDA);
// the dosa chef is CC BY-SA 4.0 by Sunnya343 via Wikimedia Commons.
const chefPhotos = {
  'chef-indian':
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Indian_Chef_%287782226182%29.jpg',
  'chef-dosa':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Chef_cooking_Mysore_masala_dosa_in_Mysuru%2C_July_2013.jpg/960px-Chef_cooking_Mysore_masala_dosa_in_Mysuru%2C_July_2013.jpg',
}

// Pani puri ka sahi photo (samosa nahi). CC0, Wikimedia Commons.
const commonsPhotos = {
  'pani-puri':
    'https://upload.wikimedia.org/wikipedia/commons/6/66/Pani_Puri_%28Gol_Gappa%29.jpg',
}

const sources = {
  ...Object.fromEntries(
    Object.entries(photos).map(([name, id]) => [name, `https://images.unsplash.com/${id}${query}`]),
  ),
  ...chefPhotos,
  ...commonsPhotos,
}

await mkdir(outDir, { recursive: true })

let ok = 0
const failed = []

for (const [name, url] of Object.entries(sources)) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'zomaeats-demo/1.0 (local development)' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const type = response.headers.get('content-type') ?? ''
    if (!type.startsWith('image/')) throw new Error(`Unexpected content-type: ${type}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.byteLength < 10_000) throw new Error(`Too small: ${buffer.byteLength} bytes`)
    await writeFile(join(outDir, `${name}.jpg`), buffer)
    ok += 1
    console.log(`✓ ${name}.jpg (${Math.round(buffer.byteLength / 1024)} KB)`)
  } catch (error) {
    failed.push({ name, message: error.message })
    console.error(`✗ ${name}: ${error.message}`)
  }
}

console.log(`\n${ok}/${Object.keys(sources).length} images downloaded`)
if (failed.length) {
  console.error('Failed:', failed.map((entry) => entry.name).join(', '))
  process.exitCode = 1
}
