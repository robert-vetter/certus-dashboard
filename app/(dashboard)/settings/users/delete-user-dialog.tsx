'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userEmail: string
  onConfirm: () => void
  isDeleting: boolean
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  userEmail,
  onConfirm,
  isDeleting
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete User</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="text-sm">
            <span className="text-gray-500">Name:</span>{' '}
            <span className="font-medium text-gray-900">{userName}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Email:</span>{' '}
            <span className="font-medium text-gray-900">{userEmail}</span>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
