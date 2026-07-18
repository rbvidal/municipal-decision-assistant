import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../auth";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { LoadingOverlay } from "../components/interaction";

const HomePage = lazy(() => import("../pages/home").then((m) => ({ default: m.HomePage })));
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
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/work/:caseId" element={<CaseWorkspacePage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/supervisor" element={<SupervisorPage />} />
              <Route path="/admin" element={<AdministrationPage />} />
              <Route path="/admin/corpus" element={<CorpusPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/work/new" element={<NewCasePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
