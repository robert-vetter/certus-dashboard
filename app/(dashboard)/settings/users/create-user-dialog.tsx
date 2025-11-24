'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser, getCreatableRoles, getAssignableLocations } from './actions'
import { useRouter } from 'next/navigation'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Role {
  rolePermissionId: number
  name: string
  description: string
  roleName: string
}

interface Location {
  locationId: string
  locationName: string
  accountId: string
}

export default function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')

  const [roles, setRoles] = useState<Role[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load roles and locations when dialog opens
  useEffect(() => {
    if (open) {
      loadRolesAndLocations()
      // Reset form
      setFullName('')
      setEmail('')
      setSelectedRoleId('')
      setSelectedLocationId('')
      setError(null)
    }
  }, [open])

  const loadRolesAndLocations = async () => {
    setLoading(true)
    try {
      const [rolesData, locationsData] = await Promise.all([
        getCreatableRoles(),
        getAssignableLocations()
      ])

      console.log('Loaded roles:', rolesData)
      console.log('Loaded locations:', locationsData)

      setRoles(rolesData)
      setLocations(locationsData)

      // Auto-select first role if only one available
      if (rolesData.length === 1) {
        setSelectedRoleId(rolesData[0].rolePermissionId.toString())
      }

      // Auto-select location if only one available
      if (locationsData.length === 1) {
        setSelectedLocationId(locationsData[0].locationId)
        console.log('Auto-selected location:', locationsData[0].locationId, locationsData[0].locationName)
      }
    } catch (err) {
      console.error('Failed to load roles/locations:', err)
      setError(`Failed to load form data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!selectedRoleId) {
      setError('Please select a role')
      return
    }

    if (!selectedLocationId) {
      setError('Please select a location')
      return
    }

    setSubmitting(true)

    try {
      const result = await createUser(
        email.trim(),
        parseInt(selectedRoleId),
        selectedLocationId,
        fullName.trim() || undefined
      )

      if (result.success) {
        onOpenChange(false)
        router.refresh() // Refresh server component to show new user
      } else {
        setError(result.error || 'Failed to create user')
      }
    } catch (err) {
      console.error('Error creating user:', err)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to your account. They will receive access to the selected location.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={submitting}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.rolePermissionId}
                      value={role.rolePermissionId.toString()}
                    >
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {role.roleName.replace('_', ' ')}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roles.length === 0 && (
                <p className="text-xs text-gray-500">
                  No roles available. You may not have permission to create users with any role.
                </p>
              )}
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
                disabled={submitting || locations.length === 1}
                required
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem
                      key={location.locationId}
                      value={location.locationId}
                    >
                      {location.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locations.length === 0 && (
                <p className="text-xs text-gray-500">
                  No locations available. You may not have access to any locations.
                </p>
              )}
              {locations.length === 1 && (
                <p className="text-xs text-gray-500">
                  Only location automatically selected
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || roles.length === 0 || locations.length === 0}
                className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
