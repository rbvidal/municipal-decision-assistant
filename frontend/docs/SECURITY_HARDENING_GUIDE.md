# Security Hardening Guide

**Version:** 1.0
**Date:** 2026-07-17
**Target:** V1.0 Pilot Deployment

---

## Authentication

### Current State (Phase 12)
- In-memory token via `setAuthToken()`/`getAuthToken()`
- `Authorization: Bearer <token>` header
- Mock user (Sabine Müller) for development

### Required for Pilot
- [ ] JWT with short expiration (15 min access, 1h refresh)
- [ ] Refresh token rotation
- [ ] Token stored in httpOnly, Secure, SameSite=Strict cookie
- [ ] Remove in-memory token entirely
- [ ] Implement proper login/logout flow
- [ ] Session invalidation on logout

### Recommended Configuration
```yaml
security:
  jwt:
    access-token-expiration: 900000   # 15 min
    refresh-token-expiration: 3600000 # 1 hour
    issuer: verwaltungsportal.de
  cookie:
    http-only: true
    secure: true
    same-site: strict
```

## Authorization

### Required for Pilot
- [ ] Role-based access control (RBAC)
- [ ] Route guards on frontend (ProtectedRoute, AdminRoute)
- [ ] Method-level security on backend (`@PreAuthorize`)
- [ ] Department-scoped data access
- [ ] Audit trail for permission changes

### Roles
| Role | Access |
|---|---|
| Systemadministrator | Full system access |
| Fachbereichsleiter | Department-wide, approval |
| Korpus-Manager | Knowledge corpus management |
| Sachbearbeiter | Own cases, document upload |
| Lesezugriff | Read-only access |

## CSRF Protection

- [ ] Enable Spring Security CSRF with cookie-based token
- [ ] Frontend reads CSRF token from cookie and sends in `X-CSRF-TOKEN` header
- [ ] Stateless API endpoints exempt from CSRF (use Bearer token validation instead)

## Content Security Policy

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self' https://api.verwaltungsportal.de;
  frame-ancestors 'none';
" always;
```

## CORS Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://verwaltungsportal.de"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-CSRF-TOKEN"));
        config.setAllowCredentials(true);
        // ...
    }
}
```

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `/api/auth/login` | 5 | 1 minute |
| `/api/auth/*` | 20 | 1 minute |
| `/api/decision/*` | 30 | 1 minute |
| `/api/*` | 100 | 1 minute |
| File upload | 10 | 1 hour |

## File Upload Security

- [ ] Maximum file size: 50 MB
- [ ] Allowed types: PDF, DOCX, XLSX, PNG, JPG, TXT
- [ ] Virus scanning before storage
- [ ] Randomize stored filenames (UUID)
- [ ] Store outside web root
- [ ] Validate MIME type (not just extension)

## LLM / Prompt Injection

### Mitigations
- [ ] Input sanitization before sending to LLM
- [ ] Output validation before displaying to user
- [ ] System prompt isolation (separate from user input)
- [ ] Rate limiting on LLM API calls
- [ ] Content filtering on LLM responses
- [ ] Human review required for generated legal text
- [ ] Audit log of all LLM interactions

### Prompt Architecture
```
[System Prompt — isolated, immutable]
[Context — structured data, not user input]
[User Input — sanitized, length-limited]
→ LLM
→ [Output — validated against schema]
→ [Citation — cross-referenced with source documents]
```

## Secrets Management

- [ ] Environment variables for all secrets (never in code)
- [ ] `.env` files in `.gitignore` (verified)
- [ ] Production secrets via vault or K8s secrets
- [ ] Database credentials rotated every 90 days
- [ ] API keys rotated every 90 days
- [ ] JWT signing key rotated every 30 days

## Security Headers

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

## Dependency Scanning

- [ ] `npm audit` in CI pipeline
- [ ] OWASP Dependency Check for Maven
- [ ] Dependabot enabled on GitHub
- [ ] Weekly automated dependency updates

## Penetration Testing

### Before Pilot
1. OWASP ZAP baseline scan
2. Manual review of auth flow
3. File upload boundary testing
4. SQL injection testing on search endpoints
5. XSS testing on all input fields

### Before Production
1. Third-party penetration test
2. LLM-specific security audit
3. Infrastructure security review
