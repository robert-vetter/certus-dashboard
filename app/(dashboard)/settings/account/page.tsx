import { Suspense } from 'react'
import AccountSettingsClient from './account-settings-client'
import { getAccountSettings } from './actions'

export default async function AccountSettingsPage() {
  const settings = await getAccountSettings()

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure account-wide settings and preferences
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <AccountSettingsClient initialSettings={settings} />
        </Suspense>
      </div>
    </div>
  )
}
