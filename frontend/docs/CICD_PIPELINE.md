# CI/CD Pipeline

**Version:** 1.0
**Date:** 2026-07-17

---

## Pipeline Overview

```
Push to branch
     │
     ▼
┌─────────┐
│  Build  │  Lint → TypeScript → Test → Build
└────┬────┘
     │
     ▼
┌─────────┐
│  Test   │  Unit → Integration → E2E → Security
└────┬────┘
     │
     ▼
┌─────────┐
│ Package │  Docker build → Push to registry
└────┬────┘
     │
     ▼
┌─────────┐
│ Deploy  │  Staging → Smoke tests → Production
└─────────┘
```

## GitHub Actions Workflow

### 1. Build & Test (on push, PR)

```yaml
name: Build & Test
on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm', cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
        working-directory: frontend
      - run: npm run lint
        working-directory: frontend
      - run: npx tsc --noEmit
        working-directory: frontend
      - run: npm test -- --coverage
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
        
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin', cache: 'maven' }
      - run: mvn verify -pl platform-api,platform-auth,platform-document
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
        working-directory: frontend
      - run: mvn org.owasp:dependency-check-maven:check
```

### 2. Integration Tests (on PR to main)

```yaml
name: Integration Tests
on:
  pull_request:
    branches: [main]

jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
      qdrant:
        image: qdrant/qdrant:latest
    steps:
      - run: mvn verify -P integration-test
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx playwright test
        working-directory: frontend
```

### 3. Package & Push (on release)

```yaml
name: Package & Push
on:
  release:
    types: [published]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/verwaltungsportal/frontend:${{ github.ref_name }}
      - uses: docker/build-push-action@v5
        with:
          context: ./platform-api
          push: true
          tags: ghcr.io/verwaltungsportal/backend:${{ github.ref_name }}
```

### 4. Deploy (on release)

```yaml
name: Deploy
on:
  release:
    types: [published]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: |
          ssh deploy@staging.verwaltungsportal.de \
            "docker compose pull && docker compose up -d"
      - run: |
          curl -f https://staging.verwaltungsportal.de/api/actuator/health
          
  smoke-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test --project=smoke
        working-directory: frontend
        
  deploy-production:
    needs: smoke-tests
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: |
          ssh deploy@verwaltungsportal.de \
            "docker compose pull && docker compose up -d"
```

## Versioning Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  1  .  0  .  0

MAJOR: Breaking changes (API changes, DB migrations)
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

### Release Checklist

- [ ] All tests pass (build)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security scan clean
- [ ] Release notes written
- [ ] Database migrations tested
- [ ] Staging deployment verified
- [ ] Smoke tests pass on staging
- [ ] Rollback plan documented

### Branch Strategy

```
main          — Production releases
  ├── develop — Integration branch
  │     ├── feature/* — Feature branches
  │     └── fix/* — Bug fix branches
  └── hotfix/* — Emergency production fixes
```

## Quality Gates

| Gate | Threshold |
|---|---|
| TypeScript errors | 0 |
| Build errors | 0 |
| Unit test coverage | > 70% |
| Lint warnings | 0 |
| Security audit | 0 HIGH/CRITICAL |
| Bundle size increase | < 10% |
| E2E pass rate | 100% |
