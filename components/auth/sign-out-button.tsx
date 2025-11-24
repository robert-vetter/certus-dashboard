'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  children?: React.ReactNode
}

export const SignOutButton = React.forwardRef<HTMLButtonElement, SignOutButtonProps>(
  function SignOutButton(
    {
      variant = 'ghost',
      size = 'default',
      showIcon = true,
      children
    },
    ref
  ) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }

    return (
      <Button
        ref={ref}
        onClick={handleSignOut}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {showIcon && <LogOut className="h-4 w-4" />}
        {children || 'Sign Out'}
      </Button>
    )
  }
)
