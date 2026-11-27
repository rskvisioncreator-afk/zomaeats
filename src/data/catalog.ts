export const CITIES = [
  {
    city: 'Delhi NCR',
    areas: [
      'Connaught Place',
      'Hauz Khas',
      'Saket',
      'Chandni Chowk',
      'Lajpat Nagar',
      'Rajouri Garden',
      'Aerocity',
      'Golf Course Road',
      'Greater Kailash',
      'Khan Market',
      'Dilshad Garden',
      'Dwarka',
    ],
    eta: '28 min',
  },
  {
    city: 'Mumbai',
    areas: ['Bandra West', 'Andheri West', 'Powai', 'Lower Parel', 'Colaba'],
    eta: '31 min',
  },
  {
    city: 'Bengaluru',
    areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar'],
    eta: '26 min',
  },
  {
    city: 'Bihar',
    areas: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif'],
    eta: '30 min',
  },
] as const

export const CUISINE_CATEGORIES = [
  { name: 'Biryani', image: '/images/biryani.jpg' },
  { name: 'Pizza', image: '/images/pizza.jpg' },
  { name: 'Burger', image: '/images/burger.jpg' },
  { name: 'North Indian', image: '/images/curry.jpg' },
  { name: 'South Indian', image: '/images/dosa.jpg' },
  { name: 'Chinese', image: '/images/noodles.jpg' },
  { name: 'Momos', image: '/images/momos.jpg' },
  { name: 'Street Food', image: '/images/pani-puri.jpg' },
  { name: 'Desserts', image: '/images/cake.jpg' },
  { name: 'Healthy', image: '/images/salad.jpg' },
  { name: 'Sushi', image: '/images/sushi.jpg' },
  { name: 'Cafe', image: '/images/coffee.jpg' },
  { name: 'Rolls', image: '/images/rolls.jpg' },
]

export const CUISINES = [
  'Biryani',
  'North Indian',
  'South Indian',
  'Chinese',
  'Pizza',
  'Burgers',
  'Momos',
  'Desserts',
  'Healthy Food',
  'Sushi',
  'Cafe',
  'Bakery',
  'Seafood',
  'Street Food',
  'BBQ',
  'Kebabs',
]

export const COLLECTIONS = [
  {
    key: 'bestseller',
    title: 'Bestsellers in town',
    subtitle: 'The dishes everyone keeps ordering',
    image: '/images/biryani.jpg',
  },
  {
    key: 'top-rated',
    title: 'Top rated restaurants',
    subtitle: 'Rated 4.5+ by real foodies',
    image: '/images/sushi.jpg',
  },
  {
    key: 'new',
    title: 'Newly opened',
    subtitle: 'Fresh kitchens, big flavours',
    image: '/images/pizza-2.jpg',
  },
] as const

export const OFFERS = [
  {
    title: '50% OFF',
    subtitle: 'Up to ₹100 on your first order',
    code: 'WELCOME50',
    tone: 'red',
  },
  {
    title: 'FREE DELIVERY',
    subtitle: 'On all orders, no minimum',
    code: 'FREEDEL',
    tone: 'dark',
  },
  {
    title: 'FLAT ₹125 OFF',
    subtitle: 'On orders above ₹499',
    code: 'TASTY125',
    tone: 'gold',
  },
] as const
