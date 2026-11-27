import { cn } from '@/lib/utils'

export function VegToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="veg-toggle">
      <span>Veg only</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn('switch switch--sm', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </label>
  )
}
