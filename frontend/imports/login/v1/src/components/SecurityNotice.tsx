/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface SecurityNoticeProps {
  message?: string;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({
  message = 'Sichere Verbindung zum städtischen Server ist aktiv. Ihre Daten werden verschlüsselt übertragen.',
}) => {
  return (
    <div className="pt-md flex items-start space-x-sm opacity-60">
      <ShieldCheck size={16} className="text-status-dot-green mt-0.5 shrink-0" />
      <p className="font-caption text-caption leading-relaxed text-on-surface">
        {message}
      </p>
    </div>
  );
};
