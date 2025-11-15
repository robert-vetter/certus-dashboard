'use client';

import React from 'react';
import Image from 'next/image';

interface DashboardHeaderProps {
  greeting: string;
  subtitle: string;
  userName?: string;
}

export function DashboardHeader({ greeting, subtitle, userName = 'CW' }: DashboardHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-7 py-5 w-full bg-white">
      <div className="flex flex-col items-start gap-2 flex-1">
        <h1 className="font-['Inter_Tight'] font-medium text-variable-collection-colors-primary-color text-2xl leading-normal">
          {greeting}
        </h1>

        <p className="font-['Inter_Tight'] font-normal text-variable-collection-colors-s-shade5 text-base leading-normal">
          {subtitle}
        </p>
      </div>

      <div className="inline-flex items-center gap-4">
        {/* Referral Banner */}
        <button
          className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-[var(--variable-collection-radius-small-radius)] border-[0.5px] border-[#ffdadf] shadow-[0px_1px_3px_#00000005,0px_6px_6px_#00000005,0px_13px_8px_#00000003,0px_24px_10px_transparent,0px_37px_10px_transparent] cursor-pointer hover:bg-gray-50 transition-colors duration-120"
          aria-label="Refer a friend and earn £200"
        >
          <p className="font-['Inter_Tight'] font-normal text-sm leading-normal">
            <span className="text-[#ee344f]">Earn £200 </span>
            <span className="text-[#747577]">Refer a Friend</span>
          </p>

          <div className="w-2.5 h-2.5" aria-hidden="true">
            <Image
              src="/icons/vector.svg"
              alt=""
              width={10}
              height={10}
              className="w-full h-full"
            />
          </div>
        </button>

        {/* User Avatar */}
        <button
          className="flex w-[35px] h-[35px] items-center justify-center gap-2.5 p-2 bg-variable-collection-colors-a-shade1 rounded-[56px] border border-[#ffb9c3] cursor-pointer hover:bg-[#ffe5e9] transition-colors duration-120"
          aria-label={`User profile: ${userName}`}
        >
          <span className="font-['Inter_Tight'] font-normal text-variable-collection-colors-secondary-color text-xs leading-normal whitespace-nowrap uppercase">
            {userName}
          </span>
        </button>
      </div>
    </header>
  );
}
