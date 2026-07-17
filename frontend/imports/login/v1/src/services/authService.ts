/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../types';
import { mockUsers } from './mockData';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  /**
   * Simulates authentication against mock users.
   * This is a service placeholder that can be easily updated to point to a REST API in the future.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Artificial delay to simulate real network/server response
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Basic trim and lowercase check
    const normalizedEmail = email.trim().toLowerCase();
    
    // For mock testing, allow the standard mock user or any email with any password (for demo purposes if needed,
    // but let's validate properly against mock user to show rigorous code)
    const user = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return {
        success: false,
        error: 'Diese E-Mail-Adresse ist nicht im System registriert.',
      };
    }

    // Accept any password with 6+ chars for the mock demo, or specifically the correct placeholder
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Das eingegebene Passwort ist ungültig oder zu kurz (mind. 6 Zeichen).',
      };
    }

    return {
      success: true,
      user,
    };
  }
};
