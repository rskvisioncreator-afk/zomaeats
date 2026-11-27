import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Quote, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Logo } from '@/components/layout/Logo'
import { SmoothImage } from '@/components/ui/SmoothImage'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { usePageTitle } from '@/hooks/useData'
import { DEMO_ACCOUNTS } from '@/data/seed'
import { friendlyError } from '@/lib/utils'

export function LoginPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, isDemo } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  usePageTitle(mode === 'login' ? 'Log in' : 'Create account')

  const next = params.get('next') || '/'
  // Only allow internal redirects.
  const safeNext = next.startsWith('/') ? next : '/'

  // Redirect a user who is already signed in, but let explicit logins pick
  // their own destination (e.g. the admin demo button).
  useEffect(() => {
    if (!loading && user && !submitting.current) navigate(safeNext, { replace: true })
  }, [loading, user, navigate, safeNext])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    submitting.current = true
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(name, email, password)
        toast.success('Account ban gaya — welcome to Zomaeats!')
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
      }
      navigate(safeNext, { replace: true })
    } catch (error) {
      toast.error(friendlyError(error, 'Login nahi ho paya'))
    } finally {
      setBusy(false)
    }
  }

  const demoLogin = async (role: 'customer' | 'admin') => {
    submitting.current = true
    setBusy(true)
    try {
      const account = DEMO_ACCOUNTS[role]
      setEmail(account.email)
      setPassword(account.password)
      await signIn(account.email, account.password)
      toast.success(role === 'admin' ? 'Admin demo account me login ho gaya' : 'Demo account me login ho gaya')
      navigate(role === 'admin' ? '/admin' : safeNext, { replace: true })
    } catch (error) {
      toast.error(friendlyError(error, 'Demo login nahi hua'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__visual">
        <SmoothImage src="/images/restaurant.jpg" alt="Restaurant ambience" />
        <span className="auth-page__overlay" />
        <div className="auth-page__top">
          <Logo />
          <Link to="/" className="link-quiet">Back to home</Link>
        </div>
        <div className="auth-page__quote">
          <Quote size={26} />
          <h2>“Good food is the foundation of genuine happiness.”</h2>
          <p>20+ kitchens. 134 dishes. Ek hi app.</p>
          <div className="auth-page__chips">
            <span><CheckCircle2 size={14} /> No hidden fees</span>
            <span><CheckCircle2 size={14} /> Live tracking</span>
            <span><CheckCircle2 size={14} /> Easy refunds</span>
          </div>
        </div>
      </div>

      <div className="auth-page__panel">
        <div className="auth-card">
          <span className="section-eyebrow">{mode === 'login' ? 'Welcome back' : 'Join the table'}</span>
          <h1>{mode === 'login' ? 'Log in to Zomaeats' : 'Create your account'}</h1>
          <p className="auth-card__sub">
            {mode === 'login'
              ? 'Order karo, track karo aur apni favourites save karo.'
              : 'Ek minute me account banao aur pehla order karo.'}
          </p>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <Input
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aarav Sharma"
                icon={<UserRound size={16} />}
                autoComplete="name"
                required
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              icon={<Lock size={16} />}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              className="auth-form__eye"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              {showPassword ? 'Hide' : 'Show'} password
            </button>

            <Button full size="lg" type="submit" loading={busy}>
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>

          {isDemo && (
            <>
              <div className="auth-divider"><span>or try the demo</span></div>
              <div className="demo-accounts">
                <button type="button" onClick={() => demoLogin('customer')} disabled={busy}>
                  <span className="demo-accounts__avatar">🍜</span>
                  <span>
                    <strong>Customer demo</strong>
                    <small>foodie@zomaeats.com</small>
                  </span>
                </button>
                <button type="button" onClick={() => demoLogin('admin')} disabled={busy}>
                  <span className="demo-accounts__avatar">🛠️</span>
                  <span>
                    <strong>Admin demo</strong>
                    <small>admin@zomaeats.com</small>
                  </span>
                  <Sparkles size={15} />
                </button>
              </div>
              <p className="auth-demo-note">
                Demo mode: koi real password nahi chahiye. Data aapke browser me save hota hai.
              </p>
            </>
          )}

          {!isDemo && (
            <>
              <div className="auth-divider"><span>or continue with</span></div>
              <Button variant="outline" full onClick={signInWithGoogle} icon={<span className="google-g">G</span>}>
                Continue with Google
              </Button>
            </>
          )}

          <p className="auth-switch">
            {mode === 'login' ? "Naya account? " : 'Pehle se account hai? '}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>

          <p className="auth-terms">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
