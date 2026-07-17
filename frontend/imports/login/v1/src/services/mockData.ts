/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Case, Document, KnowledgeEntry } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u-1',
    email: 'vorname.nachname@essen.de',
    firstName: 'Thomas',
    lastName: 'Müller',
    role: 'Administrator',
    department: 'Amt für Ratsangelegenheiten und Repräsentation',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isActive: true,
    lastLogin: '2026-07-14T14:32:00Z',
  },
  {
    id: 'u-2',
    email: 'claudia.schmidt@essen.de',
    firstName: 'Claudia',
    lastName: 'Schmidt',
    role: 'Decideur',
    department: 'Stadtplanungsamt',
    isActive: true,
    lastLogin: '2026-07-15T08:10:00Z',
  }
];

export const mockCases: Case[] = [
  {
    id: 'case-2026-001',
    title: 'Erweiterung des Bürgerradwegs Gruga-Trasse',
    description: 'Ausbau und Sanierung des Radwegs zur Verbesserung des Pendlerverkehrs.',
    status: 'InReview',
    category: 'Infrastruktur',
    createdDate: '2026-06-10T08:00:00Z',
    updatedDate: '2026-07-12T11:45:00Z',
    assignedUserId: 'u-2',
    referenceCode: 'ESS-2026-REG-098',
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'doc-101',
    fileName: 'Projektentwurf_Gruga_Trasse_V2.pdf',
    fileSize: 4194304, // 4MB
    mimeType: 'application/pdf',
    uploadedByUserId: 'u-2',
    uploadedAt: '2026-06-12T09:30:00Z',
    associatedCaseId: 'case-2026-001',
    documentType: 'Proposal',
    url: '#',
  }
];

export const mockKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: 'kb-501',
    title: 'Richtlinien für Bürgerentscheide in NRW',
    summary: 'Zusammenfassung der rechtlichen Grundlagen für kommunale Volksinitiativen.',
    content: 'Gemäß § 26 der Gemeindeordnung für das Land Nordrhein-Westfalen können Bürger über Angelegenheiten der Gemeinde einen Bürgerentscheid beantragen...',
    tags: ['Recht', 'Bürgerbeteiligung', 'NRW'],
    authorUserId: 'u-1',
    publishedAt: '2025-11-20T10:00:00Z',
    revisionNumber: 3,
  }
];
