// TrekStatusButtons.tsx
// Drop into TrekDetail.tsx beneath the trek title
// Usage: <TrekStatusButtons trekId={trek.id} trekName={trek.name} />

import { useTrekList, TrekStatus } from '../hooks/useTrekList'

interface Props {
  trekId: string
  trekName: string
}

interface ButtonConfig {
  status: Exclude<TrekStatus, null>
  icon: string
  label: string
  activeLabel: string
  activeClass: string
  inactiveClass: string
  dotClass: string
}

const BUTTONS: ButtonConfig[] = [
  {
    status: 'completed',
    icon: '✓',
    label: 'Done',
    activeLabel: 'Completed',
    activeClass: 'bg-amber-500/20 border-amber-500 text-amber-400',
    inactiveClass: 'border-white/10 text-white/40 hover:border-amber-500/50 hover:text-amber-400/70',
    dotClass: 'bg-amber-500',
  },
  {
    status: 'inProgress',
    icon: '⟳',
    label: 'Doing this',
    activeLabel: 'In Progress',
    activeClass: 'bg-sky-500/20 border-sky-400 text-sky-300',
    inactiveClass: 'border-white/10 text-white/40 hover:border-sky-400/50 hover:text-sky-300/70',
    dotClass: 'bg-sky-400',
  },
  {
    status: 'wishlist',
    icon: '◇',
    label: 'Bucket list',
    activeLabel: 'On Wishlist',
    activeClass: 'bg-violet-500/20 border-violet-400 text-violet-300',
    inactiveClass: 'border-white/10 text-white/40 hover:border-violet-400/50 hover:text-violet-300/70',
    dotClass: 'bg-violet-400',
  },
]

export default function TrekStatusButtons({ trekId, trekName }: Props) {
  const { getStatus, toggle } = useTrekList()
  const currentStatus = getStatus(trekId)

  return (
    <div className="flex flex-col gap-2 my-4">
      {/* Label */}
      <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">
        Track this trek
      </p>

      {/* Buttons row */}
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map(({ status, icon, label, activeLabel, activeClass, inactiveClass, dotClass }) => {
          const isActive = currentStatus === status
          return (
            <button
              key={status}
              onClick={() => toggle(trekId, status)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
                transition-all duration-200 cursor-pointer select-none
                ${isActive ? activeClass : inactiveClass}
              `}
              aria-label={isActive ? `Remove ${trekName} from ${activeLabel}` : `Mark ${trekName} as ${label}`}
              aria-pressed={isActive}
            >
              {/* Status dot */}
              <span className={`
                w-1.5 h-1.5 rounded-full transition-all duration-200
                ${isActive ? dotClass : 'bg-white/20'}
              `} />

              {/* Icon */}
              <span className={`text-base leading-none ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {icon}
              </span>

              {/* Label */}
              <span>{isActive ? activeLabel : label}</span>
            </button>
          )
        })}
      </div>

      {/* Confirmation micro-copy */}
      {currentStatus && (
        <p className="text-xs text-white/30 mt-1 animate-fade-in">
          {currentStatus === 'completed'  && `✓ You've completed ${trekName}. Legend.`}
          {currentStatus === 'inProgress' && `Currently on your agenda — good choice.`}
          {currentStatus === 'wishlist'   && `Added to your bucket list.`}
        </p>
      )}
    </div>
  )
}