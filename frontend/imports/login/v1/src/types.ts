/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Administrator' | 'Decideur' | 'Mitarbeiter';
  department: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'InReview' | 'Approved' | 'Rejected';
  category: string;
  createdDate: string;
  updatedDate: string;
  assignedUserId?: string;
  referenceCode: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadedByUserId: string;
  uploadedAt: string;
  associatedCaseId?: string;
  documentType: 'Proposal' | 'Report' | 'Minutes' | 'Decision';
  url: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  authorUserId: string;
  publishedAt: string;
  revisionNumber: number;
}
