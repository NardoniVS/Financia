import React from 'react';
import { Fingerprint } from 'lucide-react';

type BrandLogoProps = {
  compact?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3">
      <Fingerprint
        className={`shrink-0 text-blue-200 ${compact ? 'h-9 w-9' : 'h-12 w-12'}`}
        strokeWidth={2.1}
        aria-hidden="true"
      />
      <span className={`font-bold tracking-tight text-white ${compact ? 'text-2xl' : 'text-3xl'}`}>
        TudoOK
      </span>
    </div>
  );
};
