'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateAccountSettings } from './actions'
import { useRouter } from 'next/navigation'

interface AccountSettingsClientProps {
  initialSettings: {
    accountId: string
    userCreationPermissionLevel: number
  }
}

const roleOptions = [
  { value: 1, label: 'Support Staff', description: 'Front-line support and basic operations' },
  { value: 2, label: 'Manager', description: 'Location managers and supervisors' },
  { value: 3, label: 'Senior Manager', description: 'Multi-location oversight' },
  { value: 4, label: 'Admin', description: 'Full administrative access' },
  { value: 5, label: 'Owner', description: 'Account owners only' },
]

export default function AccountSettingsClient({ initialSettings }: AccountSettingsClientProps) {
  const router = useRouter()
  const [userCreationLevel, setUserCreationLevel] = useState(
    initialSettings.userCreationPermissionLevel.toString()
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    try {
      const result = await updateAccountSettings(parseInt(userCreationLevel))

      if (result.success) {
        setSuccess(true)
        router.refresh()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error('Error updating settings:', err)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedRole = roleOptions.find(r => r.value === parseInt(userCreationLevel))
  const hasChanges = initialSettings.userCreationPermissionLevel.toString() !== userCreationLevel

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Management Permissions</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userCreationLevel">Who can create new users?</Label>
            <Select
              value={userCreationLevel}
              onValueChange={setUserCreationLevel}
              disabled={submitting}
            >
              <SelectTrigger id="userCreationLevel" className="w-full">
                <SelectValue placeholder="Select minimum role level" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Users with the role of <span className="font-medium">{selectedRole?.label}</span> or higher
              will be able to create new users in your account.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">Permission Hierarchy</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Users can only create other users with roles at or below their own permission level.
                  For example, a Manager can create Support Staff but cannot create Admins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-green-700">Settings updated successfully!</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={submitting || !hasChanges}
          className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
