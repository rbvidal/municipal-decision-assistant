/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FormState {
  aktenzeichen: string;
  fachbereich: string;
  vorgangsart: string;
  betreff: string;
  priority: 'low' | 'medium' | 'high';
  beschreibung: string;
  
  // Step 2 Fields: Antragsteller
  antragstellerName: string;
  antragstellerEmail: string;
  antragstellerAbteilung: string;
  
  // Step 3 Fields: Unterlagen
  uploadedFiles: { name: string; size: string }[];
}

export type StepId = 1 | 2 | 3 | 4;

export interface HelpCard {
  title: string;
  content: string;
  isItalic?: boolean;
}
