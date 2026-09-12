---
title: Autoresearch Autonomous Agent Loop
category: Karpathy Skills
tags: [karpathy, autoresearch, agents, evals, skills]
skill_level: ADVANCED
author: Andrej Karpathy (Refactored for DirtyNest)
---

# Karpathy Skill: Autonomous Research & Experimentation Loop

## The LLM Autoresearch Paradigm
An autonomous research agent operates not as a chatbot, but as an infinite hypothesis-test-iterate loop over code repositories.

### The 4-Phase Cycle
1. **Hypothesis Formulation**: Generate candidate parameter tweaks or architectural diffs.
2. **Execution Sandbox**: Spawn isolated subprocess to train/benchmark for $N$ iterations.
3. **Evaluation Matrix**: Parse loss curves, validation P99 latency, and accuracy SLA.
4. **Git Commit / Rollback**: Auto-commit winners to branch; discard regressions.

```typescript
interface AutoresearchEngine {
  generateCandidateDiff(): Promise<GitDiff>;
  executeBenchmark(diff: GitDiff): Promise<BenchmarkMetrics>;
  validateScore(metrics: BenchmarkMetrics): boolean;
  commitWinner(): Promise<void>;
}
```

Connected nodes: [[BPE Tokenizer from Scratch]], [[Zero-Trust Mesh & Secure Enclave Architecture]].
