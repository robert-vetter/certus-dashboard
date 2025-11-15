import React from 'react';
import Image from 'next/image';

interface KPITileProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

export function KPITile({ icon, label, value }: KPITileProps) {
  return (
    <div className="flex flex-col items-start justify-between p-1.5 flex-1 bg-white rounded-lg overflow-hidden border-[0.5px] border-variable-collection-colors-p-shade6 shadow-[0px_1px_3px_#00000005,0px_6px_6px_#00000005,0px_13px_8px_#00000003,0px_24px_10px_transparent,0px_37px_10px_transparent]">
      {/* Header Section */}
      <div className="flex flex-col items-start gap-2.5 p-5 w-full bg-[#ffecee] rounded-lg">
        <div className="inline-flex items-center justify-center gap-2.5">
          <Image
            src={`/icons/${icon}.svg`}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <div className="font-['Inter_Tight'] font-normal text-variable-collection-colors-p-shade3 text-base leading-normal whitespace-nowrap">
            {label}
          </div>
        </div>
      </div>

      {/* Value Section */}
      <div className="flex items-center justify-center gap-2.5 p-5 w-full">
        <div className="flex-1 font-['Inter_Tight'] font-medium text-variable-collection-colors-primary-color text-2xl leading-normal">
          {value}
        </div>
      </div>
    </div>
  );
}
