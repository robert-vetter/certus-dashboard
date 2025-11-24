'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Pencil } from 'lucide-react'
import CreateUserDialog from './create-user-dialog'
import EditUserDialog from './edit-user-dialog'
import DeleteUserDialog from './delete-user-dialog'
import { deleteUser } from './actions'
import { useRouter } from 'next/navigation'

interface User {
  userId: string
  email: string
  displayName: string | null
  createdAt: string
  roleName: string
  rolePermissionName: string
  rolePermissionId: number
  locations: Array<{
    locationId: string
    locationName: string
  }>
}

interface UsersClientProps {
  users: User[]
}

export default function UsersClient({ users }: UsersClientProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return

    setIsDeleting(true)

    const result = await deleteUser(deletingUser.userId)

    if (result.success) {
      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
      router.refresh() // Refresh server component
    } else {
      alert(`Failed to delete user: ${result.error}`)
    }

    setIsDeleting(false)
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Permission Set</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Locations</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found. Create your first user to get started.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {user.displayName ? (
                        <div>
                          <div className="font-medium text-gray-900">{user.displayName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      ) : (
                        <div className="text-gray-900">{user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {user.roleName.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.rolePermissionName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.locations.length === 0 ? (
                        <span className="text-gray-400">No locations</span>
                      ) : user.locations.length === 1 ? (
                        user.locations[0].locationName
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span>{user.locations[0].locationName}</span>
                          <span className="text-xs text-gray-400">
                            +{user.locations.length - 1} more
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={isDeleting}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={editingUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        userName={deletingUser?.displayName || deletingUser?.email || ''}
        userEmail={deletingUser?.email || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
