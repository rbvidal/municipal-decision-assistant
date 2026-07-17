# Backend Integration Checklist

**Date:** 2026-07-17
**Target:** Spring Boot REST API

## Pre-Integration (Must Complete Before Starting)

- [ ] Install and initialize lucide-react (TD-01)
- [ ] Move auth token from localStorage to httpOnly cookie (TD-02)
- [ ] Implement ProtectedRoute and AdminRoute components (TD-06)
- [ ] Migrate remaining pages from mocks/ to hooks/ (TD-03)
- [ ] Add mutation hooks for all CRUD operations (TD-04)

## API Client Integration

- [ ] Configure VITE_API_BASE_URL for Spring Boot backend
- [ ] Add CSRF token handling to ApiClient
- [ ] Add request/response interceptors for error handling
- [ ] Add retry logic with exponential backoff
- [ ] Add request timeout configuration
- [ ] Add request cancellation support

## Service Layer Migration

- [ ] Create RestCaseService implementing CaseService
- [ ] Create RestKnowledgeService implementing KnowledgeService
- [ ] Create RestDocumentService implementing DocumentService
- [ ] Create RestUserService implementing UserService
- [ ] Create RestSupervisorService implementing SupervisorService
- [ ] Create RestCorpusService implementing CorpusService
- [ ] Create RestAdminService implementing AdminService
- [ ] Switch exports from mock services to REST services

## Authentication

- [ ] Integrate with Spring Boot authentication endpoint
- [ ] Implement JWT token refresh flow
- [ ] Add token expiry detection
- [ ] Add automatic token refresh before expiry
- [ ] Implement logout (invalidate token)
- [ ] Add 401 response interceptor (redirect to login)

## File Upload

- [ ] Add multipart/form-data support to ApiClient
- [ ] Add upload progress tracking
- [ ] Add file size validation
- [ ] Add file type validation
- [ ] Implement resumable uploads for large files

## Real-Time Updates

- [ ] Implement WebSocket client for live updates
- [ ] Add background job progress WebSocket
- [ ] Add notification WebSocket
- [ ] Add Qdrant metrics polling/WebSocket

## Data Layer

- [ ] Configure TanStack Query for server state
- [ ] Add optimistic updates for mutations
- [ ] Add cache invalidation strategies
- [ ] Add pagination support to all list hooks
- [ ] Add infinite query support for large lists

## Error Handling

- [ ] Map Spring Boot error responses to ApiError
- [ ] Add field-level validation errors
- [ ] Add global error toast notifications
- [ ] Add retry UI for failed queries

## Testing

- [ ] Set up Vitest + React Testing Library
- [ ] Write smoke tests for all pages
- [ ] Write integration tests for service layer
- [ ] Write E2E tests for critical user flows
- [ ] Add mock service worker (MSW) for tests

## Security

- [ ] Add CSP headers
- [ ] Add CORS configuration
- [ ] Add rate limiting awareness
- [ ] Sanitize user input in free text fields
- [ ] Audit all dangerouslySetInnerHTML usage (none currently)

## Deployment

- [ ] Configure production Vite build
- [ ] Set up Spring Boot static resource serving
- [ ] Configure cache headers for assets
- [ ] Set up CI/CD pipeline
- [ ] Add environment-specific configuration

## Documentation

- [ ] Update API_MAPPING.md with actual endpoints
- [ ] Document authentication flow
- [ ] Document deployment process
- [ ] Create developer onboarding guide
