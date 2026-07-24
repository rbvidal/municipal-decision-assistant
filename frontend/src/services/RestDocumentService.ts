import { apiClient } from "../api";
import type { DocumentItem } from "../types/domain";

export interface DocumentUploadResult {
  id: string;
  status: string;
  title: string;
}

export interface DocumentContentResult {
  documentId: string;
  title: string;
  type: string;
  versionNumber: number;
  text: string;
  anchors: Array<{ chunkId: string; chunkIndex: number; startOffset: number; endOffset: number; text: string }>;
}

// ── Raw API response shapes ──

interface ApiDocumentResponse {
  id: string;
  tenantId: string | null;
  title: string;
  type: string;
  status: string;
  category: string | null;
  tags: string[];
  visibility: string;
  currentVersion: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  versions: ApiDocumentVersion[];
}

interface ApiDocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageProvider: string;
}

interface ApiDocumentPage {
  documents: ApiDocumentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── Mapping ──

function mapDocument(api: ApiDocumentResponse): DocumentItem {
  const status = mapStatus(api.status);
  return {
    id: api.id,
    titel: api.title,
    name: api.title + (api.type === "PDF" ? ".pdf" : api.type === "DOCX" ? ".docx" : api.type === "TXT" ? ".txt" : ""),
    typ: api.type,
    status,
    kategorie: api.category ?? "",
    erstellt: formatDate(api.createdAt),
    geaendert: formatDate(api.updatedAt),
    groesse: api.versions?.[0]?.sizeBytes != null ? formatBytes(api.versions[0].sizeBytes) : "-",
    versionen: api.currentVersion,
    version: api.currentVersion,
    versions: (api.versions ?? []).map((v) => ({
      version: String(v.versionNumber),
      date: "",
      author: "",
      isCurrent: v.versionNumber === api.currentVersion,
    })),
    ocrStatus: "OK",
    vorgangId: "-",
    dokumentId: api.id,
    buerger: "-",
    dateigroesse: api.versions?.[0]?.sizeBytes != null ? formatBytes(api.versions[0].sizeBytes) : "-",
    hochgeladenAm: formatDate(api.createdAt),
    detailedTyp: api.type,
  };
}

function mapStatus(raw: string): string {
  switch (raw) {
    case "READY": return "Bereit";
    case "PROCESSING": return "In_Bearbeitung";
    case "ERROR": return "Fehler";
    case "ARCHIVED": return "Archiviert";
    default: return raw;
  }
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso.substring(0, 10);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ── Service ──

export interface DocumentService {
  getAll(): Promise<DocumentItem[]>;
  getById(id: string): Promise<DocumentItem>;
  getContent(id: string): Promise<DocumentContentResult>;
  search(query: string): Promise<DocumentItem[]>;
  upload(file: File, title?: string, onProgress?: (pct: number) => void): Promise<DocumentUploadResult>;
}

export const restDocumentService: DocumentService = {
  getAll: async () => {
    const data = await apiClient.get<ApiDocumentPage>("/api/documents");
    return (data.documents ?? []).map(mapDocument);
  },
  getById: async (id) => {
    const data = await apiClient.get<ApiDocumentResponse>(`/api/documents/${id}`);
    return mapDocument(data);
  },
  getContent: (id) => apiClient.get<DocumentContentResult>(`/api/documents/${id}/content`),
  search: async (query) => {
    const data = await apiClient.get<ApiDocumentResponse[]>("/api/documents/search", { q: query });
    return data.map(mapDocument);
  },
  upload: (file, title, onProgress) => {
    const path =
      "/api/documents/upload" + (title ? `?title=${encodeURIComponent(title)}` : "");
    return apiClient.upload<DocumentUploadResult>(path, file, onProgress);
  },
};
