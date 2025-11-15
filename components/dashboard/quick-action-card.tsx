'use client';

import React from 'react';
import Image from 'next/image';

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2 w-full bg-[#f7f8fa] rounded-[var(--variable-collection-radius-small-radius)] border-[0.5px] border-[#fff3f5] hover:bg-[#f0f1f3] transition-colors duration-120 cursor-pointer"
    >
      <div className="inline-flex items-center gap-3">
        <div className="items-center gap-2.5 p-2 bg-variable-collection-colors-a-shade1 rounded-lg inline-flex">
          <Image
            src={`/icons/${icon}.svg`}
            alt=""
            width={18}
            height={18}
            className="w-[18px] h-[18px]"
          />
        </div>

        <div className="flex-col items-start justify-center gap-0.5 inline-flex">
          <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade2 text-base leading-normal whitespace-nowrap">
            {title}
          </div>

          <p className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-[10px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {description}
          </p>
        </div>
      </div>

      <Image
        src="/icons/CaretRight.svg"
        alt=""
        width={16}
        height={16}
        className="w-4 h-4"
      />
    </button>
  );
}
