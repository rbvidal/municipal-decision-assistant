/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Info, X } from 'lucide-react';

import TopNavBar from './components/TopNavBar';
import Header from './components/Header';
import NextTask from './components/NextTask';
import CaseTable from './components/CaseTable';
import SuggestionsSidebar from './components/SuggestionsSidebar';
import StatsGrid from './components/StatsGrid';
import Footer from './components/Footer';

import {
  NewCaseModal,
  EditCaseModal,
  LegalTextModal,
  EmailDraftModal,
} from './components/InteractiveDialogs';

import {
  mockNextTask,
  mockVorgaenge,
  mockSuggestions,
  mockStats,
} from './data';

import { Vorgang, StatCard } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<Vorgang[]>(mockVorgaenge);
  const [stats, setStats] = useState<StatCard[]>(mockStats);
  
  // Modal states
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<Vorgang | null>(null);
  const [selectedCaseForLegal, setSelectedCaseForLegal] = useState<string | null>(null);
  const [selectedCaseForEmail, setSelectedCaseForEmail] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Automatically dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Recalculate statistics dynamically when the cases list changes
  useEffect(() => {
    const totalCount = cases.length + 43; // base 43 hidden rows + current dynamic items
    const overdueCount = cases.filter((c) => c.status === 'Überfällig').length + 1; // base 1 other overdue + current
    const todayCount = cases.filter((c) => c.status === 'In Prüfung').length + 4; // base 4 other today fällig
    const citizenCount = cases.filter((c) => c.status === 'Wartet Bürger').length + 11; // base 11 others
    
    setStats((prevStats) =>
      prevStats.map((stat) => {
        if (stat.id === 'meine_vorgaenge') {
          return {
            ...stat,
            value: totalCount,
            percentage: Math.min(100, Math.round((totalCount / 60) * 100)),
          };
        }
        if (stat.id === 'ueberfaellig') {
          return {
            ...stat,
            value: overdueCount,
            percentage: Math.min(100, Math.round((overdueCount / 20) * 100)),
          };
        }
        if (stat.id === 'heute_faellig') {
          return {
            ...stat,
            value: todayCount,
            percentage: Math.min(100, Math.round((todayCount / 20) * 100)),
          };
        }
        if (stat.id === 'wartet_buerger') {
          return {
            ...stat,
            value: citizenCount,
          };
        }
        return stat;
      })
    );
  }, [cases]);

  // Action handlers
  const handleCreateCase = (newCase: Omit<Vorgang, 'actionText'>) => {
    const fullCase: Vorgang = {
      ...newCase,
      actionText: 'Bearbeiten',
    };
    setCases([fullCase, ...cases]);
    showToast(`Vorgang ${newCase.id} erfolgreich erfasst!`);
  };

  const handleUpdateCase = (updatedCase: Vorgang) => {
    setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    showToast(`Änderungen für ${updatedCase.id} erfolgreich gespeichert.`);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(cases.filter((c) => c.id !== caseId));
    showToast(`Vorgang ${caseId} wurde erfolgreich gelöscht.`, 'info');
  };

  const handleOpenTask = (taskId: string) => {
    // Search for task in list, or find it by ID
    const found = cases.find((c) => c.id === taskId);
    if (found) {
      setSelectedCaseForEdit(found);
    } else {
      showToast(`Vorgang ${taskId} wird geöffnet.`, 'info');
    }
  };

  const handleOpenLegalText = (caseId: string) => {
    setSelectedCaseForLegal(caseId);
  };

  const handleOpenEmailDraft = (caseId: string) => {
    setSelectedCaseForEmail(caseId);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-background flex flex-col antialiased">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            className="fixed top-20 right-4 z-[9999] flex items-center gap-md px-lg py-md rounded-lg shadow-lg border bg-surface-container-lowest text-sm max-w-sm"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              borderColor: toast.type === 'success' ? '#276749' : '#3182CE',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="text-status-success shrink-0" size={18} />
            ) : (
              <Info className="text-primary shrink-0" size={18} />
            )}
            <p className="text-text-primary text-xs font-semibold flex-grow">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <TopNavBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Area */}
      <main className="mt-[56px] flex-grow">
        <div className="max-w-[1400px] mx-auto px-lg py-xl">
          {/* Greeting Page Title & Action Header */}
          <Header onNewCaseClick={() => setIsNewCaseOpen(true)} />

          {/* Core Applet Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
            
            {/* Left Main Pane (70% width) */}
            <div className="lg:col-span-8 flex flex-col gap-lg">
              {/* Highlighted recommended Next Task */}
              <NextTask task={mockNextTask} onOpenTask={handleOpenTask} />

              {/* Editable cases table with search filtering */}
              <CaseTable
                cases={cases}
                searchQuery={searchQuery}
                onEditCase={(item) => setSelectedCaseForEdit(item)}
              />
            </div>

            {/* Right Side Support Panel (30% width) */}
            <aside className="lg:col-span-4 flex flex-col gap-lg h-full">
              <SuggestionsSidebar
                suggestions={mockSuggestions}
                onOpenLegalText={handleOpenLegalText}
                onOpenEmailDraft={handleOpenEmailDraft}
              />
            </aside>
          </div>

          {/* Workflow statistic meters */}
          <StatsGrid stats={stats} />
        </div>
      </main>

      {/* Footer bar */}
      <Footer />

      {/* Dialog Modals */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onSubmit={handleCreateCase}
      />

      <EditCaseModal
        isOpen={selectedCaseForEdit !== null}
        caseItem={selectedCaseForEdit}
        onClose={() => setSelectedCaseForEdit(null)}
        onSave={handleUpdateCase}
        onDelete={handleDeleteCase}
      />

      <LegalTextModal
        isOpen={selectedCaseForLegal !== null}
        caseId={selectedCaseForLegal || ''}
        onClose={() => setSelectedCaseForLegal(null)}
      />

      <EmailDraftModal
        isOpen={selectedCaseForEmail !== null}
        caseId={selectedCaseForEmail || ''}
        onClose={() => setSelectedCaseForEmail(null)}
        onSendSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
