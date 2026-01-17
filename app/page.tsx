import { auth } from "@/auth"
import { redirect } from "next/navigation"
import GoogleSignInButton from "@/components/GoogleSignInButton"

export default async function Home() {
  const session = await auth()
  
  // Redirect to dashboard if already authenticated
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen w-full liquid-glass-bg flex items-center justify-center p-4">
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title card */}
        <div className="card-premium text-center mb-8 animate-float">
          <div className="mb-6">
            <div className="inline-block p-2 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 w-32 h-32">
              <img src="/rarity-pony-cartoon.png" alt="Rarity Runner Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Rarity Runner
          </h1>
          <p className="text-lg text-foreground/70 font-medium">
            Track your running stats with style
          </p>
        </div>
        
        {/* Sign in card */}
        <div className="card-premium text-center">
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            Welcome Back
          </h2>
          <p className="text-foreground/60 mb-8">
            Sign in to access your running dashboard
          </p>
          
          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>
          
          <div className="mt-8 pt-6 border-t border-foreground/10">
            <p className="text-sm text-foreground/50">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs font-medium text-foreground/70">Track Stats</p>
          </div>
          <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-2xl mb-2">🏃‍♂️</div>
            <p className="text-xs font-medium text-foreground/70">Log Runs</p>
          </div>
          <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-xs font-medium text-foreground/70">See Progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}
