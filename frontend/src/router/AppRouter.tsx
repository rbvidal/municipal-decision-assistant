import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, ProtectedRoute } from "../auth";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { LoadingOverlay } from "../components/interaction";

const HomePage = lazy(() => import("../pages/home").then((m) => ({ default: m.HomePage })));
const MyWorkPage = lazy(() => import("../pages/my-work").then((m) => ({ default: m.MyWorkPage })));
const CaseWorkspacePage = lazy(() =>
  import("../pages/case-workspace").then((m) => ({ default: m.CaseWorkspacePage })),
);
const KnowledgePage = lazy(() =>
  import("../pages/knowledge").then((m) => ({ default: m.KnowledgePage })),
);
const DocumentsPage = lazy(() =>
  import("../pages/documents").then((m) => ({ default: m.DocumentsPage })),
);
const SupervisorPage = lazy(() =>
  import("../pages/supervisor").then((m) => ({ default: m.SupervisorPage })),
);
const AdministrationPage = lazy(() =>
  import("../pages/administration").then((m) => ({ default: m.AdministrationPage })),
);
const CorpusPage = lazy(() => import("../pages/corpus").then((m) => ({ default: m.CorpusPage })));
const UsersPage = lazy(() => import("../pages/users").then((m) => ({ default: m.UsersPage })));
const NewCasePage = lazy(() =>
  import("../pages/new-case").then((m) => ({ default: m.NewCasePage })),
);
const NotFoundPage = lazy(() =>
  import("../pages/not-found").then((m) => ({ default: m.NotFoundPage })),
);
const LoginPage = lazy(() =>
  import("../pages/auth").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/auth").then((m) => ({ default: m.RegisterPage })),
);
const SearchPage = lazy(() =>
  import("../pages/search").then((m) => ({ default: m.SearchPage })),
);
const AuditPage = lazy(() =>
  import("../pages/audit").then((m) => ({ default: m.AuditPage })),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const PageLoader = () => (
  <LoadingOverlay visible message="Seite wird geladen..." blocking={false} />
);

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/work" element={<ProtectedRoute><MyWorkPage /></ProtectedRoute>} />
              <Route path="/work/:caseId" element={<ProtectedRoute><CaseWorkspacePage /></ProtectedRoute>} />
              <Route path="/knowledge" element={<ProtectedRoute><KnowledgePage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/supervisor" element={<ProtectedRoute><SupervisorPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdministrationPage /></ProtectedRoute>} />
              <Route path="/admin/corpus" element={<ProtectedRoute><CorpusPage /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path="/work/new" element={<ProtectedRoute><NewCasePage /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
