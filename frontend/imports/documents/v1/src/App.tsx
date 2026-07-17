import { useState } from "react";
import { TopNavBar } from "./components/TopNavBar";
import { SubNavBar } from "./components/SubNavBar";
import { Sidebar } from "./components/Sidebar";
import { DocumentTable } from "./components/DocumentTable";
import { DetailPreview } from "./components/DetailPreview";
import { Footer } from "./components/Footer";
import { mockDocuments } from "./mockData";
import styles from "./App.module.css";

export default function App() {
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("vorgangsdokumente");
  const [selectedDocumentId, setSelectedDocumentId] = useState("doc-1");

  // Find the currently selected document details
  const selectedDocument = mockDocuments.find(
    (doc) => doc.id === selectedDocumentId
  ) || mockDocuments[0];

  const handleSelectDocument = (id: string) => {
    setSelectedDocumentId(id);
  };

  const handleUploadClick = () => {
    alert("Datei hochladen wird geöffnet...");
  };

  const handleNewDocClick = () => {
    alert("Ein neues Dokument wird erstellt...");
  };

  return (
    <div className={styles.app}>
      {/* Header TopNavBar */}
      <TopNavBar userName="S. Müller" userInitials="SM" />

      {/* Subnavigation Bar */}
      <SubNavBar activeTab={activeSubTab} onTabChange={setActiveSubTab} />

      {/* Main Grid View */}
      <main className={styles.main}>
        {/* Left column navigation */}
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Center column document list */}
        <DocumentTable
          documents={mockDocuments}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={handleSelectDocument}
          onUploadClick={handleUploadClick}
          onNewDocClick={handleNewDocClick}
        />

        {/* Right column preview panel */}
        <DetailPreview document={selectedDocument} />
      </main>

      {/* Footer copyright and references */}
      <Footer />
    </div>
  );
}
