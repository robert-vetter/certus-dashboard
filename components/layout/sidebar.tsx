'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    id: 'overview',
    href: '/overview',
    icon: 'House',
    label: 'Overview',
  },
  {
    id: 'analytics',
    href: '/analytics',
    icon: 'ChartLineUp',
    label: 'Analytics',
  },
  {
    id: 'call-logs',
    href: '/call-logs',
    icon: 'PhoneList',
    label: 'Call Logs',
  },
  {
    id: 'settings',
    href: '/settings',
    icon: 'GearSix',
    label: 'Settings',
  },
  {
    id: 'support',
    href: '/support',
    icon: 'Question',
    label: 'Support',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col w-20 h-screen items-center gap-8 px-4 py-8 bg-white border-r border-gray-200"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Toggle Button */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors duration-150"
        aria-label="Toggle sidebar"
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Image
          src="/icons/CaretDoubleRight.svg"
          alt=""
          width={14}
          height={14}
          className="w-3.5 h-3.5 opacity-40"
        />
      </button>

      {/* Logo */}
      <div className="w-10 h-10 flex items-center justify-center">
        <Image
          src="/Logo.svg"
          alt="Certus"
          width={40}
          height={40}
          className="w-10 h-10"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/20'
                  : 'hover:bg-gray-50'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Image
                src={`/icons/${item.icon}.svg`}
                alt=""
                width={22}
                height={22}
                className={`w-5.5 h-5.5 transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                }`}
                style={isActive ? { filter: 'brightness(0) invert(1)' } : {}}
              />

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-4 w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
