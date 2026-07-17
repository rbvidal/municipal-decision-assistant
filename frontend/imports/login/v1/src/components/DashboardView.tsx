/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Case, Document, KnowledgeEntry } from '../types';
import { mockCases, mockDocuments, mockKnowledgeEntries } from '../services/mockData';
import { LogOut, Folder, FileText, BookOpen, Clock, Tag, UserCheck, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  user: User;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onLogout }) => {
  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to translate statuses
  const translateStatus = (status: Case['status']) => {
    switch (status) {
      case 'Draft': return { label: 'Entwurf', color: 'bg-surface-container-high text-on-surface-variant' };
      case 'InReview': return { label: 'In Prüfung', color: 'bg-secondary-container text-on-secondary-container' };
      case 'Approved': return { label: 'Genehmigt', color: 'bg-status-dot-green/10 text-status-success' };
      case 'Rejected': return { label: 'Abgelehnt', color: 'bg-status-dot-red/10 text-status-error' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-[840px] bg-white border border-border-default z-10 flex flex-col shadow-sm"
    >
      {/* Header bar */}
      <div className="p-2xl border-b border-border-default flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-lowest gap-lg">
        <div className="flex items-center space-x-lg">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-default bg-surface flex-shrink-0">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGJbjvzct892_VvIfmGZRMBhMWCFa6GdusK-VXcNgHgnMCO3FRTuPrFw8jqjhEfnOO3YyCpc5eiWuJklj0cKlZ9XTzthpBz7TP53jmkkUAHhDTJA2zEmL1cHX0vlrBI78h0MsssDX3EVDYqC8T949n_LygOfuUhfNPji5LNrB4304GUIENDju6tfbRE1zl1KlZxctLMQJ4tt8kA9XYQ5MxlWe6wPcIzDOc-eQMqabVwVtGAAXJwCo8AyNoZUMbwlQH85qNajPo0bw9" 
              alt="Essen Rathaus"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-text-primary tracking-tight">Stadt Essen</h1>
            <p className="font-caption text-caption text-on-surface-variant">Kommunale Entscheidungsplattform</p>
          </div>
        </div>

        {/* User Info / Logout */}
        <div className="flex items-center space-x-xl w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-md md:pt-0 border-border-default">
          <div className="flex items-center space-x-md">
            {user.avatarUrl ? (
              <img className="w-9 h-9 rounded-full object-cover border border-border-default" src={user.avatarUrl} alt={user.firstName} />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-label-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
            <div className="text-left">
              <p className="font-label-sm text-label-sm text-text-primary leading-tight">{user.firstName} {user.lastName}</p>
              <p className="font-caption text-[11px] text-on-surface-variant">{user.role} • {user.department}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-xs h-9 px-md rounded border border-border-default hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-caption font-semibold"
            title="Abmelden"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="p-3xl space-y-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
          
          {/* Column 1: Decisions & Cases */}
          <div className="space-y-lg">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-sm border-b border-border-default pb-xs uppercase tracking-wider text-[11px]">
              <Folder size={16} className="text-primary" />
              Aktive Entscheidungsfälle ({mockCases.length})
            </h2>
            
            <div className="space-y-md">
              {mockCases.map((c) => {
                const statusInfo = translateStatus(c.status);
                return (
                  <div key={c.id} className="p-md border border-border-default bg-surface rounded-DEFAULT space-y-sm">
                    <div className="flex justify-between items-start gap-md">
                      <span className="font-case-id text-[11px] text-outline font-semibold tracking-wide">{c.referenceCode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-[15px] text-text-primary font-bold leading-snug">{c.title}</h3>
                    <p className="font-body-md text-caption text-on-surface-variant leading-relaxed">{c.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-outline pt-xs border-t border-border-default border-dashed">
                      <span className="flex items-center gap-xs">
                        <Clock size={12} />
                        Aktualisiert: {new Date(c.updatedDate).toLocaleDateString('de-DE')}
                      </span>
                      <span className="font-semibold text-primary">{c.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Documents & Knowledge Base */}
          <div className="space-y-2xl">
            {/* Documents section */}
            <div className="space-y-lg">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-sm border-b border-border-default pb-xs uppercase tracking-wider text-[11px]">
                <FileText size={16} className="text-primary" />
                Zugeordnete Dokumente ({mockDocuments.length})
              </h2>
              
              <div className="space-y-md">
                {mockDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    onClick={(e) => e.preventDefault()}
                    className="p-md border border-border-default bg-white hover:bg-surface-container-low hover:border-primary transition-all rounded-DEFAULT flex items-start gap-md cursor-pointer group"
                  >
                    <div className="p-sm bg-primary-container/20 rounded text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText size={20} />
                    </div>
                    <div className="space-y-xs min-w-0 flex-1">
                      <h4 className="font-label-sm text-body-md text-text-primary group-hover:text-primary transition-colors truncate font-semibold">
                        {doc.fileName}
                      </h4>
                      <p className="text-[11px] text-outline">
                        Typ: {doc.documentType} • Größe: {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Knowledge Entries section */}
            <div className="space-y-lg">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-sm border-b border-border-default pb-xs uppercase tracking-wider text-[11px]">
                <BookOpen size={16} className="text-primary" />
                Wissensdatenbank ({mockKnowledgeEntries.length})
              </h2>
              
              <div className="space-y-md">
                {mockKnowledgeEntries.map((kb) => (
                  <div key={kb.id} className="p-md border border-border-default bg-surface rounded-DEFAULT space-y-sm">
                    <h4 className="font-label-sm text-body-md text-text-primary font-bold">{kb.title}</h4>
                    <p className="font-body-md text-caption text-on-surface-variant leading-relaxed">{kb.summary}</p>
                    
                    <div className="flex flex-wrap gap-xs pt-xs">
                      {kb.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-2xs px-sm py-0.5 bg-white border border-border-default rounded text-[11px] text-on-surface-variant">
                          <Tag size={10} className="text-outline" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Security / Server Info footer note inside Dashboard */}
        <div className="p-md bg-surface-container-low rounded border border-border-default flex items-center justify-between text-caption text-on-surface-variant">
          <div className="flex items-center space-x-sm">
            <UserCheck size={16} className="text-status-success" />
            <span>Angemeldet als <strong>{user.firstName} {user.lastName}</strong> ({user.role})</span>
          </div>
          <div className="flex items-center space-x-xs text-[11px] text-outline font-mono">
            <Shield size={12} className="text-status-success" />
            <span>AES-256 SESSION ACTIVE</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
