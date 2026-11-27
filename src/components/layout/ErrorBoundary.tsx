import { Component, type ErrorInfo, type ReactNode } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="crash-screen">
          <span className="crash-screen__icon"><UtensilsCrossed size={30} /></span>
          <h1>Kuch jal gaya kitchen me 🔥</h1>
          <p>App me unexpected error aaya. Page refresh karke dobara try karo.</p>
          <code>{this.state.message}</code>
          <div className="crash-screen__actions">
            <Button onClick={() => window.location.reload()}>Reload app</Button>
            <Button variant="outline" onClick={() => { window.location.href = '/' }}>Go home</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
