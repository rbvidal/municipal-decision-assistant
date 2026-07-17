/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  currentStepLabel?: string;
  onNavigateHome?: () => void;
}

export default function Breadcrumb({ currentStepLabel, onNavigateHome }: BreadcrumbProps) {
  return (
    <section className="sub-navigation" id="sub-navigation">
      <div className="breadcrumb-content">
        <a 
          href="#" 
          className="breadcrumb-link" 
          onClick={(e) => { e.preventDefault(); if (onNavigateHome) onNavigateHome(); }}
          id="breadcrumb-home"
        >
          Startseite
        </a>
        <span className="breadcrumb-separator">
          <ChevronRight size={14} />
        </span>
        <span className="breadcrumb-current">Neuer Vorgang</span>
        {currentStepLabel && (
          <>
            <span className="breadcrumb-separator">
              <ChevronRight size={14} />
            </span>
            <span style={{ color: 'var(--color-on-surface-variant)' }}>{currentStepLabel}</span>
          </>
        )}
      </div>
    </section>
  );
}
