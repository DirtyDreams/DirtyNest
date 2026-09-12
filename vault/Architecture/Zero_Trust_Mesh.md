---
title: Zero-Trust Mesh & Secure Enclave Architecture
category: System Arch
tags: [architecture, security, zero-trust, network, enclave]
author: ARCHITECT-01
---

# Zero-Trust Mesh & Secure Enclave Architecture

## Architectural Overview
DirtyNest enforces strict isolation between public-facing browser endpoints and private operational engines.
All intra-process and inter-service communications traverse an authenticated, encrypted bus with mutual TLS and ephemeral token verification.

### Core Principles
1. **Never Trust, Always Verify**: Every API request must supply signed JWT sessions verified via `jose` against `JWT_SECRET`.
2. **Sidecar Isolation**: Subprocesses (CDP browser automation, Docker socket controls, Hermes ACP subprocesses) execute strictly inside the FastAPI sidecar boundaries.
3. **Database Guardrails**: Drizzle ORM runs with strict tenant isolation scoped to authenticated operator IDs.

Cross-references: [[Hermes Control Room & Agent Swarm]], [[Autoresearch Autonomous Agent Loop]].
