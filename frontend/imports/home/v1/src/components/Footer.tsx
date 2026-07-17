/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Footer() {
  return (
    <footer id="dashboard-footer" className="w-full py-md px-lg flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-container-lowest border-t border-border-default mt-xl">
      <div className="flex items-center gap-lg">
        <span className="font-bold text-primary text-sm">VerwaltungsPortal</span>
        <span className="font-caption text-caption text-on-surface-variant text-xs text-slate-500">
          © 2026 Deutsche Kommunalverwaltung
        </span>
      </div>
      <div className="flex gap-lg">
        <a className="font-caption text-caption text-on-surface-variant text-xs hover:text-primary hover:opacity-100 transition-opacity opacity-80" href="#">
          Impressum
        </a>
        <a className="font-caption text-caption text-on-surface-variant text-xs hover:text-primary hover:opacity-100 transition-opacity opacity-80" href="#">
          Datenschutz
        </a>
        <a className="font-caption text-caption text-on-surface-variant text-xs hover:text-primary hover:opacity-100 transition-opacity opacity-80" href="#">
          Kontakt
        </a>
      </div>
    </footer>
  );
}
