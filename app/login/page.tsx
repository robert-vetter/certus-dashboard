'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkUserExists } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  // Check for error messages in URL params and ensure user is signed out
  useEffect(() => {
    // Sign out any existing session on login page
    supabase.auth.signOut()

    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')

    if (error === 'no_permissions') {
      setMessage({
        type: 'error',
        text: 'No permissions assigned. Please contact your administrator.',
      })
    } else if (error === 'authentication_failed') {
      setMessage({
        type: 'error',
        text: 'Authentication failed. Please try again.',
      })
    }
  }, [supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const normalizedEmail = email.toLowerCase().trim()

      // Check if user exists and has permissions
      const { exists, hasPermissions } = await checkUserExists(normalizedEmail)

      if (!exists) {
        setMessage({
          type: 'error',
          text: 'Email not found. Please contact your administrator.',
        })
        return
      }

      if (!hasPermissions) {
        setMessage({
          type: 'error',
          text: 'No permissions assigned. Please contact your administrator.',
        })
        return
      }

      // User exists and has permissions, send magic link
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) throw signInError

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link!',
      })
    } catch (error: unknown) {
      console.error('Login error:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <Image
                src="/Logo.svg"
                alt="Certus"
                width={96}
                height={96}
                className="w-24 h-24 drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-br from-red-500 to-pink-600 bg-clip-text text-transparent mb-2">
            Certus
          </h2>
        </div>

        {/* Welcome Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full h-12 px-4 text-base rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 transition-colors"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl text-sm font-medium transition-all ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              We&apos;ll email you a secure link.
              <br />
              Click it to access your dashboard instantly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Need help?{' '}
          <a href="mailto:support@certus.com" className="text-red-600 hover:text-red-700 font-medium transition-colors">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
