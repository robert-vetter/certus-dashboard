'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    id: 'home',
    href: '/overview',
    icon: 'House',
    label: 'Home',
  },
  {
    id: 'analytics',
    href: '/analytics',
    icon: 'AlignLeft',
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
    href: '/configuration',
    icon: 'GearSix',
    label: 'Settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col w-20 h-screen items-center gap-10 px-4 py-8 bg-variable-collection-colors-primary-color"
      data-variable-collection-mode="white"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Toggle Button */}
      <button
        className="w-3.5 h-3.5"
        aria-label="Toggle sidebar"
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Image
          src="/icons/CaretDoubleRight.svg"
          alt=""
          width={14}
          height={14}
          className="w-3.5 h-3.5"
        />
      </button>

      {/* Logo */}
      <div className="w-5 h-[27px]">
        <Image
          src="/icons/image.svg"
          alt="Certus logo"
          width={20}
          height={27}
          className="w-5 h-[27px]"
        />
      </div>

      {/* Navigation Items */}
      <nav className="inline-flex flex-col items-center gap-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <div
              key={item.id}
              className={
                isActive
                  ? 'inline-flex items-center gap-2.5 p-0.5 bg-variable-collection-inner-box rounded-[10px]'
                  : 'inline-flex items-center justify-center gap-2.5 p-2 rounded-[var(--variable-collection-radius-small-radius)] bg-variable-collection-colors-a-shade1'
              }
            >
              <Link
                href={item.href}
                className={
                  isActive
                    ? 'inline-flex gap-2.5 p-2 bg-variable-collection-colors-candy-20 rounded-lg shadow-[inset_0px_0px_4.3px_#bf001b,inset_1px_0_0_rgba(255,255,255,0.32),inset_-1px_0_33px_rgba(0,0,0,0.16)] backdrop-blur-[50.0px] items-center'
                    : 'inline-flex items-center justify-center gap-2.5'
                }
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Image
                  src={`/icons/${item.icon}.svg`}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
