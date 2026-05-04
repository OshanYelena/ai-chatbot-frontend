'use client'

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep base */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2044 30%, #0a1a35 60%, #060e1f 100%)'
      }} />

      {/* Animated color orbs */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, #1a6aff 0%, #0044cc 40%, transparent 70%)',
          animation: 'blob 9s infinite',
          filter: 'blur(40px)',
        }}
      />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #00d4ff 0%, #0088cc 40%, transparent 70%)',
          animation: 'blob 11s infinite 2s',
          filter: 'blur(50px)',
        }}
      />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #7b4fff 0%, #4422cc 40%, transparent 70%)',
          animation: 'blob 13s infinite 4s',
          filter: 'blur(45px)',
        }}
      />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #00ffcc 0%, #00aa88 40%, transparent 70%)',
          animation: 'blob 10s infinite 1s',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Noise grain overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
