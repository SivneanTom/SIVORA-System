export default function Spinner({ size = 'md', light = false }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  const c = light ? 'border-white/30 border-t-white' : 'border-sand border-t-charcoal'
  return <div className={`${s} ${c} border-2 rounded-full animate-spin`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  )
}
