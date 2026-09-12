---
title: Hermes Control Room & Agent Swarm
category: System Arch
tags: [hermes, acp, agent-swarm, control-room, architecture]
author: ARCHITECT-01
---

# Hermes Control Room & Agent Swarm

## System Summary
The Hermes Control Room bridges frontend WebSocket channels with the underlying `dirtydaily` ACP agent profile.

### Core Components
- **ACP Bridge**: `sidecar/acp_client.py` communicates with the local Hermes binary via asynchronous IPC streams.
- **Cognition Traces**: `thought` events stream in real-time to the browser, revealing agent reasoning steps and planning trees.
- **HITL Security Gate**: High-risk tools (file deletions, system modifications, live social publishing) pause execution until explicit human authorization is granted.

Related documents: [[Zero-Trust Mesh & Secure Enclave Architecture]], [[Quantum Decryption & Threat Intelligence Beacon]].
