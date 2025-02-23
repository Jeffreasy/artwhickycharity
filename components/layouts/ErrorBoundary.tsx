'use client'

import React, { Component, ErrorInfo } from 'react'
import * as Sentry from "@sentry/nextjs"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert ErrorInfo to a plain object that Sentry can handle
    const extraInfo = {
      componentStack: errorInfo.componentStack
    }
    
    Sentry.captureException(error, { extra: extraInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-lg text-white/80">Please try refreshing the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 