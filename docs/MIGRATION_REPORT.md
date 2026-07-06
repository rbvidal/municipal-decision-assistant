# Municipal Decision Assistant — Migration Report

**Date:** July 2026
**Source:** Enterprise AI Platform v1.0.0
**Target:** Municipal Decision Assistant v1.0.0
**Purpose:** SCCON demonstration application — hard fork

---

## Summary

The Municipal Decision Assistant was created as a hard fork of the Enterprise AI Platform repository. All user-visible branding strings were renamed. Internal architecture, package names, module names, SPIs, and database schemas were preserved.

---

## What Was Renamed

| Category | Before | After |
|----------|--------|-------|
| **Project directory** | `enterprise-ai-platform/` | `municipal-decision-assistant/` |
| **Root artifactId** | `enterprise-ai-platform` | `municipal-decision-assistant` |
| **Root name** | `enterprise-ai-platform` | `Municipal Decision Assistant` |
| **Version** | `0.1.0-SNAPSHOT` | `1.0.0-SNAPSHOT` |
| **SCM/Issues/CI URLs** | `github.com/cognitera/enterprise-ai-platform` | `github.com/cognitera/municipal-decision-assistant` |
| **Developer name** | Enterprise AI Platform Contributors | Municipal Decision Assistant Contributors |
| **Spring application name** | `enterprise-ai-platform` | `municipal-decision-assistant` |
| **DB default name** | `enterprise_ai_platform` | `municipal_decision_assistant` |
| **JWT issuer** | `enterprise-ai-platform` | `municipal-decision-assistant` |
| **Qdrant collection** | `enterprise_ai_chunks` | `mda_chunks` |
| **Docker containers/network** | `enterprise-ai-platform-*` | `mda-*` |
| **Banner** | Enterprise AI Platform v0.1.0 | Municipal Decision Assistant v1.0.0 |
| **App display name** | Enterprise AI Platform | Municipal Decision Assistant |
| **HTML page titles** | Enterprise AI Platform | Municipal Decision Assistant |
| **README** | Rewritten — municipal/SCCON positioning | |
| **RELEASE_NOTES** | Rewritten — SCCON demo release | |
| **TESTING** | Title updated | |
| **e2e tests** | Comment and test question updated | |

---

## What Was Preserved

- All Java package names (`com.cognitera.platform.*`)
- All 9 Maven module artifactIds (`platform-api`, `platform-ai`, etc.)
- All SPI interfaces (`ChatCompletionProvider`, `EmbeddingProvider`, etc.)
- All database schema (Flyway V1-V7 migrations)
- All REST API paths
- All internal class names and method signatures
- All `.idea` project configuration

---

## Design Decision: Why `mda` as the Docker prefix

The full product name "municipal-decision-assistant" is 29 characters. Docker container names are frequently typed in terminal commands. Using `mda` (Municipal Decision Assistant acronym) provides practical brevity while remaining recognizable.

---

*End of migration report.*
