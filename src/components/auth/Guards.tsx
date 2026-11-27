import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'

function AuthLoader() {
  return (
    <div className="page-loader">
      <span className="spinner" />
      <p>Checking your session...</p>
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />
  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, signIn, isDemo } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />
  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  if (!isAdmin) {
    return (
      <div className="container page">
        <EmptyState
          icon={<ShieldAlert size={28} />}
          title="Admin access chahiye"
          description={
            isDemo
              ? 'Demo admin account se login karo — admin@zomaeats.com. Ya Firebase me users/{uid} document ka role "admin" kar do.'
              : 'Aapke account ke paas admin permission nahi hai. Firestore me users/{uid}.role ko "admin" set karo.'
          }
          action={
            isDemo ? (
              <Button
                onClick={() => {
                  void signIn('admin@zomaeats.com', 'demo1234')
                }}
              >
                Switch to demo admin
              </Button>
            ) : (
              <Button to="/">Back to home</Button>
            )
          }
        />
      </div>
    )
  }

  return <>{children}</>
}
