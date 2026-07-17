# Test Strategy

**Version:** 1.0
**Date:** 2026-07-17

---

## Testing Pyramid

```
        ┌──────┐
        │ E2E  │  10% — Critical user flows
       ┌┴──────┴┐
       │  API   │  20% — Service integration
      ┌┴────────┴┐
      │ Component│  30% — UI components
     ┌┴──────────┴┐
     │    Unit    │  40% — Functions, hooks, utilities
     └────────────┘
```

## Unit Testing

### Frontend (Vitest + React Testing Library)

**Coverage Target:** 70%

| Category | What to Test | Priority |
|---|---|---|
| Utility functions | classnames, formatting, validation | High |
| Hooks | All 21 TanStack Query hooks | High |
| Services | All 8 mock service implementations | High |
| Components | Core primitives (Button, Badge, Icon, Panel) | Medium |
| Pages | Smoke tests (render without crash) | Medium |

### Backend (JUnit 5 + Mockito)

**Coverage Target:** 70%

| Category | What to Test | Priority |
|---|---|---|
| Services | Business logic, decision pipeline | High |
| Controllers | Request/response mapping | High |
| Repositories | Query methods | Medium |
| Mappers | DTO mapping | Medium |

## Component Testing

### Frontend Component Tests

```tsx
// Example: Panel component test
describe('Panel', () => {
  it('renders title and children', () => {
    render(<Panel title="Test"><p>Content</p></Panel>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('renders header action', () => {
    render(<Panel title="Test" headerAction={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
  
  it('handles subtle variant', () => {
    const { container } = render(<Panel variant="subtle" />);
    expect(container.firstChild).toHaveClass('subtle');
  });
});
```

### Critical Components to Test

| Component | Priority | Reason |
|---|---|---|
| DataTable | Critical | Used in 7 pages |
| Dialog | Critical | Focus trap, portal, a11y |
| Wizard | Critical | Multi-step state management |
| SearchBar | High | Used in 5 pages |
| FilterPanel | High | Complex state |
| CaseHeader | High | Used in 3 pages |
| DecisionWorkspace | High | Core differentiator |

## Integration Testing

### Service Integration

```tsx
// Example: Service factory test
describe('ServiceFactory', () => {
  it('returns mock service in development', () => {
    // VITE_USE_MOCK_SERVICES defaults to true
    expect(caseService.getCase('test')).resolves.toBeDefined();
  });
  
  it('mock services return correct types', async () => {
    const result = await caseService.getCase('BAU-2026-0147');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title');
  });
});
```

### API Integration (Backend)

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class DecisionControllerIT {
    @Test
    void shouldReturnDecisionPackage() {
        DecisionPackage result = restClient
            .get("/api/decision/BAU-2026-0147")
            .retrieve()
            .body(DecisionPackage.class);
        assertThat(result.getCaseId()).isEqualTo("BAU-2026-0147");
    }
}
```

## End-to-End Testing (Playwright)

### Critical User Flows

1. **Home → Case Workspace → Decision Support**
   - Navigate to home page
   - Click into a case
   - Switch to Decision Support tab
   - Verify evidence, reasoning, citations render

2. **Knowledge Search → Result → Preview**
   - Search for "BauO NRW"
   - Verify result cards render
   - Click result, verify preview pane

3. **Document Management → Upload → Preview**
   - Navigate to documents
   - Upload a document
   - Verify it appears in table
   - Click to preview

4. **Supervisor Approval → Approve**
   - Navigate to supervisor
   - Select a case
   - Verify draft + verifications render
   - Click approve

5. **New Case Wizard**
   - Navigate to new case
   - Complete all 6 steps
   - Verify success banner

## LLM Evaluation

### Metrics

| Metric | Description | Target |
|---|---|---|
| MRR | Mean Reciprocal Rank — retrieval quality | > 0.80 |
| NDCG@10 | Normalized Discounted Cumulative Gain | > 0.85 |
| Citation Accuracy | % of citations matching source | > 95% |
| Hallucination Rate | % of generated text not in sources | < 5% |

### Evaluation Dataset
- 50 curated municipal cases
- Known correct regulations and decisions
- Human-annotated evidence
- Expected citations verified by legal expert

## Performance Testing

| Test | Tool | Target |
|---|---|---|
| API load test | k6 | 100 req/s sustained |
| Vector search | k6 | p95 < 100ms |
| Decision pipeline | k6 | p95 < 30s |
| Concurrent users | k6 | 50 concurrent |

## Security Testing

| Test | Tool | Frequency |
|---|---|---|
| OWASP ZAP scan | ZAP | Before every release |
| Dependency audit | npm audit, OWASP DC | Weekly |
| SAST | SonarQube | Per commit |

## Test Infrastructure

```yaml
# vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
    },
  },
});
```
