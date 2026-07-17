import React, { useState } from 'react';
import { Send, Sparkles, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RegulationItem, ChecklistProposal } from '../types';
import { applicableRegulations, checklistProposals } from '../mockData';

interface DecisionSupportProps {
  onAddChecklistProposal: (text: string) => void;
  onExecuteNextAction: () => void;
  nextActionCompleted: boolean;
}

export const DecisionSupport: React.FC<DecisionSupportProps> = ({
  onAddChecklistProposal,
  onExecuteNextAction,
  nextActionCompleted,
}) => {
  const [question, setQuestion] = useState('');
  const [isExtendedOpen, setIsExtendedOpen] = useState(false);
  const [conversations, setConversations] = useState<{ q: string; a: string }[]>([]);

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      let responseText = `Gemäß BauO NRW regelt dieser Aspekt die Anforderungen an die Standsicherheit und den Brandschutz. Für Carports sind insbesondere die Abstandsflächen (§ 6 BauO NRW) einzuhalten.`;
      
      if (question.toLowerCase().includes('brand') || question.toLowerCase().includes('schutz')) {
        responseText = `Der Brandschutz für Sonderbauten und Nebengebäude ist in § 65 BauO NRW verankert. Für diesen Carport ist ein Brandschutznachweis zwingend erforderlich, da dieser an der Grundstücksgrenze errichtet wird.`;
      } else if (question.toLowerCase().includes('abstand') || question.toLowerCase().includes('grenze')) {
        responseText = `Grenzabstände und Abstandsflächen sind in § 6 BauO NRW geregelt. Die Abstandsflächen müssen auf dem eigenen Grundstück liegen, es sei denn, es liegt eine Grenzbebauung nach § 6 Abs. 11 vor (z. B. für Garagen und Carports bis zu 9m Länge).`;
      }

      setConversations([...conversations, { q: question.trim(), a: responseText }]);
      setQuestion('');
    }
  };

  return (
    <aside className="right-sidebar" id="decision-support-sidebar">
      <div className="right-sidebar-content">
        
        {/* Ask Question Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="sidebar-title-caption">FRAGE ZUM FALL STELLEN</label>
          <form onSubmit={handleQuestionSubmit} className="question-input-wrapper" id="fall-question-form">
            <input
              type="text"
              className="question-input"
              placeholder="Welcher Paragraf regelt..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              id="fall-question-input"
            />
            <button type="submit" className="question-submit-btn" title="Frage absenden" id="fall-question-submit">
              <Send size={15} />
            </button>
          </form>

          {/* Q&A dialogue list */}
          {conversations.length > 0 && (
            <div style={{ 
              marginTop: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              backgroundColor: 'var(--color-surface-container-lowest)',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border-default)'
            }} id="qa-responses-container">
              {conversations.map((c, i) => (
                <div key={i} style={{ fontSize: '11px', lineHeight: '14px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Frage: {c.q}</p>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>{c.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary card */}
        <div className="ai-summary-card" id="ai-summary-widget">
          <div className="ai-summary-header">
            <span>Zusammenfassung</span>
            <span className="ai-spark-icon"><Sparkles size={14} /></span>
          </div>
          <div className="ai-summary-body">
            Bauantrag für einen Carport auf Flurstück 102/5. Antragsteller Thomas Becker. Erste Prüfung zeigt Konformität mit Bebauungsplan, jedoch fehlt der Brandschutznachweis (§65 BauO NRW). Keine nachbarschaftlichen Einwände dokumentiert.
          </div>
        </div>

        {/* Regulations card */}
        <div className="right-panel-card" id="regulations-widget">
          <div className="right-panel-header">
            Anwendbare Vorschriften
          </div>
          <div className="right-panel-body">
            {applicableRegulations.map((reg) => (
              <div 
                key={reg.id} 
                className="regulation-item"
                onClick={() => alert(`${reg.code}: ${reg.title}\nDetailierte rechtliche Richtlinien für Bauvorhaben in NRW.`)}
                id={`regulation-${reg.id}`}
              >
                <p className="regulation-code">{reg.code}</p>
                <p className="regulation-title">{reg.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions card */}
        <div className="right-panel-card" id="suggestions-widget">
          <div className="right-panel-header">
            Vorschläge für Checkliste
          </div>
          <div className="right-panel-body" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checklistProposals.map((prop) => (
                <div key={prop.id} className="proposal-item" id={`proposal-${prop.id}`}>
                  <button 
                    type="button" 
                    className="proposal-icon" 
                    style={{ background: 'none', border: 'none', padding: 0 }}
                    onClick={() => onAddChecklistProposal(prop.text)}
                    title="Zur Checkliste hinzufügen"
                    id={`add-proposal-btn-${prop.id}`}
                  >
                    <PlusCircle size={14} />
                  </button>
                  <span>{prop.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Recommendation block */}
        <div className="action-recommendation" id="next-action-widget">
          <p className="recommendation-title">Vorgeschlagene nächste Aktion</p>
          <p className="recommendation-text">
            {nextActionCompleted 
              ? 'Brandschutznachweis erfolgreich angefordert' 
              : 'Anforderung Brandschutznachweis versenden'
            }
          </p>
          <button 
            className="btn btn-primary btn-full" 
            onClick={onExecuteNextAction}
            disabled={nextActionCompleted}
            style={{ 
              opacity: nextActionCompleted ? 0.6 : 1, 
              cursor: nextActionCompleted ? 'not-allowed' : 'pointer' 
            }}
            id="btn-execute-next-action"
          >
            {nextActionCompleted ? 'Aktion ausgeführt' : 'Aktion ausführen'}
          </button>
        </div>

        {/* Collapsible Extended */}
        <div style={{ marginTop: 'auto' }}>
          <button 
            className="collapsible-trigger"
            onClick={() => setIsExtendedOpen(!isExtendedOpen)}
            id="collapsible-trigger-btn"
          >
            <span>Erweitert</span>
            <span>
              {isExtendedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          
          {isExtendedOpen && (
            <div style={{ 
              padding: '12px 4px', 
              fontSize: '11px', 
              color: 'var(--color-on-surface-variant)',
              lineHeight: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }} id="extended-details-panel">
              <p><strong>Gemarkung:</strong> Gelsenkirchen (4210)</p>
              <p><strong>Flur:</strong> 12, Flurstück: 102/5</p>
              <p><strong>Bebauungsplan:</strong> Nr. 345 "Am Carportpark"</p>
              <p><strong>Bauklasse:</strong> GK 1 (Geringe Höhe)</p>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
