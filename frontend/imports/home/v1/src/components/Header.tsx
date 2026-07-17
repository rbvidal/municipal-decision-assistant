/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onNewCaseClick: () => void;
}

export default function Header({ onNewCaseClick }: HeaderProps) {
  const [formattedDate, setFormattedDate] = useState<string>('Mittwoch, 15. Juli 2026');

  useEffect(() => {
    // Format the date in German language
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      // Use standard local German format
      const dateStr = new Date('2026-07-15T09:34:20').toLocaleDateString('de-DE', options);
      setFormattedDate(dateStr);
    } catch (e) {
      // Fallback
      setFormattedDate('Mittwoch, 15. Juli 2026');
    }
  }, []);

  return (
    <div className="mb-3xl flex flex-col sm:flex-row sm:items-end justify-between gap-md">
      <div>
        <h1 id="greeting-title" className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
          Guten Morgen, Frau Müller.
        </h1>
        <p id="current-date-display" className="font-body-md text-on-surface-variant mt-xs">
          {formattedDate}
        </p>
      </div>
      <div className="flex gap-sm">
        <button
          id="btn-neuer-vorgang"
          onClick={onNewCaseClick}
          className="bg-primary text-on-primary px-lg py-sm rounded font-label-sm font-semibold hover:bg-[#1A365D] transition-colors flex items-center gap-xs cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Plus size={18} /> Neuer Vorgang
        </button>
      </div>
    </div>
  );
}
