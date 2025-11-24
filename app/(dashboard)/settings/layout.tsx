'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, Building2, Bell, Shield } from 'lucide-react'

const settingsNavItems = [
  {
    name: 'User Management',
    href: '/settings/users',
    icon: Users,
    description: 'Manage users and permissions'
  },
  {
    name: 'Account Settings',
    href: '/settings/account',
    icon: Building2,
    description: 'Account details and preferences'
  },
  // Future settings pages can be added here
  // {
  //   name: 'Notifications',
  //   href: '/settings/notifications',
  //   icon: Bell,
  //   description: 'Configure notification preferences'
  // },
  // {
  //   name: 'Security',
  //   href: '/settings/security',
  //   icon: Shield,
  //   description: 'Security and privacy settings'
  // }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <nav className="px-3 pb-6">
          <ul className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
