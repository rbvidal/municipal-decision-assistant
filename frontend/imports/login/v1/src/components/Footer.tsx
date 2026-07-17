/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FooterProps {
  currentLang: 'DE' | 'EN';
  onLangChange: (lang: 'DE' | 'EN') => void;
  version?: string;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onLangChange,
  version = 'v2.4.1',
}) => {
  return (
    <footer className="w-full h-[56px] border-t border-border-default bg-surface-container-lowest flex items-center justify-between px-3xl shrink-0 z-10">
      {/* Links */}
      <div className="flex items-center space-x-xl">
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Impressum
        </a>
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Datenschutz
        </a>
      </div>

      {/* Language & Version */}
      <div className="flex items-center space-x-xl">
        <div className="flex items-center space-x-md">
          <button
            onClick={() => onLangChange('DE')}
            className={`font-label-sm text-[12px] pb-0.5 cursor-pointer transition-all ${
              currentLang === 'DE'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => onLangChange('EN')}
            className={`font-label-sm text-[12px] pb-0.5 cursor-pointer transition-all ${
              currentLang === 'EN'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            EN
          </button>
        </div>
        <div className="h-4 w-[1px] bg-border-default"></div>
        <span className="font-case-id text-caption text-outline select-none">{version}</span>
      </div>
    </footer>
  );
};
