# Navigation Design

## Design Goals

The navigation must:
- Put work first, not features
- Show the user where they are and what needs attention
- Separate daily work from administration
- Never hide the primary action path behind menus
- Work at 1280-1920px with persistent visibility

## Primary Navigation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Municipality Logo]  Municipal Decision Platform           [🔔] [👤 Müller] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ● Startseite    ● Meine Arbeit    ● Wissen    ● Dokumente    ● Verwaltung   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  (page content)                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Navigation Items

| Label | Route | Purpose |
|---|---|---|
| **Startseite** | `/home` | Today's work overview. What needs my attention right now. |
| **Meine Arbeit** | `/work` | Case inbox, active cases, draft decisions, approval queue, archive |
| **Wissen** | `/knowledge` | Regulations, procedures, templates, checklists, search |
| **Dokumente** | `/documents` | Document management, upload, version history, indexing status |
| **Verwaltung** | `/admin` | Corpus health, audit, jobs, benchmarks, system configuration |

### Why This Structure

**Startseite (Home):** Opens with work, not AI. The user sees their workload immediately — pending applications, deadlines, urgent tasks. The AI input is available but secondary. This is the opposite of ChatGPT's blank prompt.

**Meine Arbeit (My Work):** The heart of the product. A unified workspace that follows the complete case lifecycle — inbox to archive. This is where the Sachbearbeiter spends 80% of their day.

**Wissen (Knowledge):** Regulations and procedures separated from case work. When the user needs to look something up without a specific case context, this is where they go. Search is prominent here.

**Dokumente (Documents):** Document lifecycle management. Upload, metadata, versioning, indexing. Separated from Knowledge because managing documents is a different mental mode than consulting them.

**Verwaltung (Administration):** Everything technical. Corpus health, audit logs, jobs, benchmarks, developer tools. None of this belongs in the main workflow. Normal Sachbearbeiter may never click this.

### What Changed From the Old Navigation

| Old | New | Why |
|---|---|---|
| `/decision` | Integrated into Startseite + Meine Arbeit | AI is a tool within workflow, not a standalone page |
| `/cases` | Meine Arbeit | Cases are the work, not a separate concept |
| `/regulations` | Wissen | Broader concept — includes procedures, templates, FAQs |
| `/search` | Integrated into Wissen + Documents | Search is a capability everywhere, not a page |
| `/workspaces` | Removed from main nav | Workspaces are a configuration concept in Verwaltung |
| `/graph` | Verwaltung (sub-page) | Knowledge graph is an admin/advanced feature |
| `/analytics` | Verwaltung (sub-page) | Analytics is admin, not daily work |
| `/audit` | Verwaltung (sub-page) | Audit is admin |
| `/jobs` | Verwaltung (sub-page) | Jobs is admin |

## Secondary Navigation

### Meine Arbeit sub-navigation

```
[ Posteingang (3) ]  [ Offene Vorgänge (12) ]  [ Warten (5) ]  [ Genehmigung (2) ]  [ Archiv (47) ]
```

### Wissen sub-navigation

```
[ Alles ]  [ Vorschriften ]  [ Verfahren ]  [ Vorlagen ]  [ FAQs ]  [ Fälle ]  [ Bürger ]  [ Dokumente ]
```

### Dokumente sub-navigation

```
[ Alle Dokumente ]  [ Hochladen ]  [ Index-Status ]
```

### Verwaltung sub-navigation

```
[ Übersicht ]  [ Korpus-Status ]  [ Audit ]  [ Aufträge ]  [ Benchmarks ]  [ Entwickler ]
```

## Top Bar

Right side of the top bar:

| Element | Purpose |
|---|---|
| Notification bell (🔔) | Click opens dropdown with recent notifications. Badge with unread count. See Notification Bell below. |
| User menu (👤 Name) | Profile, Change Password, Language (DE/EN), Logout |

### Notification Bell

Clicking the bell opens a dropdown panel (320px wide, max-height 480px, scrollable):

```
┌──────────────────────────────────────────────────┐
│  Benachrichtigungen                   [ Alle lesen ]│
├──────────────────────────────────────────────────┤
│                                                  │
│  ● Genehmigung erforderlich            Vor 10 Min │
│    BAU-2026-0147 wurde zur Genehmigung            │
│    eingereicht (Müller).                          │
│    [ Vorgang öffnen ]                             │
│                                                  │
│  ● Neu zugewiesen                     Vor 1 Std  │
│    BÜRG-2026-0154 wurde Ihnen zugewiesen.         │
│    [ Vorgang öffnen ]                             │
│                                                  │
│  ○ Bürger-Dokument hochgeladen         Vor 3 Std  │
│    BAU-2026-0143: Lageplan.pdf.                   │
│    [ Dokument anzeigen ]                          │
│                                                  │
│  ○ Frist nähert sich                  Vor 5 Std  │
│    BAU-2026-0147: Noch 3 Std bis zur Frist.       │
│    [ Vorgang öffnen ]                             │
│                                                  │
│  ○ Vorgang überfällig                 Vor 1 Tag  │
│    BÜRG-2026-0150 ist seit 12 Tagen überfällig.   │
│    [ Vorgang öffnen ]                             │
│                                                  │
├──────────────────────────────────────────────────┤
│  Alle Benachrichtigungen anzeigen                 │
└──────────────────────────────────────────────────┘
```

**States:**
- ● Filled dot = unread. ○ Empty dot = read.
- Badge on bell icon: number of unread notifications (max "9+")
- Red badge: approvals, overdue. Blue badge: assignments, uploads, info.
- "Alle lesen" marks all as read.
- Clicking a notification opens the related item and marks it as read.
- Notifications are client-side only (no persistence model in v1.0).

## Breadcrumb

Every page shows a breadcrumb:

```
Startseite > Meine Arbeit > Vorgang #2026-0147 > Entscheidungsentwurf
```

## Responsive Behavior

| Device | Width | Navigation | Tables | Forms | Upload | Decision Support |
|---|---|---|---|---|---|---|
| Desktop (FHD) | 1920px | Full, persistent | 50 rows, all columns | Full | Full | Sidebar, always visible |
| Desktop (standard) | 1280-1919px | Full, persistent | 50 rows, all columns | Full | Full | Collapsible sidebar |
| Laptop | 1024-1279px | Full, reduced padding | 25 rows, essential columns | Read-only | No | Hidden (use Wissen search) |
| Tablet | <1024px | Hamburger menu | View only, 10 rows | No | No | Not available |
| Phone | <768px | Not supported | Not supported | No | No | Not available |
