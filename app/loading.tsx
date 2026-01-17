export default function Loading() {
  return (
    <div className="min-h-screen w-full liquid-glass-bg flex items-center justify-center p-4">
      {/* Floating orbs for visual interest (static/pulse for loading) */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title card skeleton */}
        <div className="glass-card text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 rounded-2xl bg-white/20 animate-pulse flex items-center justify-center">
               <div className="text-4xl animate-bounce">🦄</div>
            </div>
          </div>
          
          <div className="h-10 w-48 mx-auto bg-white/20 rounded-lg animate-pulse mb-3"></div>
          <div className="h-6 w-64 mx-auto bg-white/20 rounded-md animate-pulse"></div>
        </div>
        
        {/* Sign in card skeleton */}
        <div className="glass-card text-center">
          <div className="h-8 w-40 mx-auto bg-white/20 rounded-md mb-2 animate-pulse"></div>
          <div className="h-5 w-56 mx-auto bg-white/20 rounded-md mb-8 animate-pulse"></div>
          
          <div className="flex justify-center">
            <div className="h-12 w-full max-w-sm bg-white/20 rounded-xl animate-pulse"></div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="h-4 w-48 mx-auto bg-white/20 rounded-md animate-pulse"></div>
          </div>
        </div>
        
        {/* Feature highlights skeleton */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 text-center">
              <div className="w-8 h-8 mx-auto bg-white/20 rounded-md mb-2 animate-pulse"></div>
              <div className="h-3 w-16 mx-auto bg-white/20 rounded-sm animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
