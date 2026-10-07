type IconName = 'search' | 'close' | 'chevron' | 'arrow' | 'bowl' | 'filter' | 'bag'

const paths: Record<IconName, string> = {
  bag: 'M5 7h14l2 14H3L5 7ZM8 7V6a4 4 0 0 1 8 0v1',
  search: 'M21 21l-4.4-4.4M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm6 9 6 6 6-6',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  bowl: 'M3 11h18c0 5-4 9-9 9s-9-4-9-9ZM7 22h10M8 7c-2-2 2-3 0-5m4 5c-2-2 2-3 0-5m4 5c-2-2 2-3 0-5',
  filter: 'M4 7h16M4 17h16M8 4v6m8 4v6',
}

export default function MenuIcon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`menu-icon ${className}`} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
