---
title: BPE Tokenizer from Scratch
category: Karpathy Skills
tags: [karpathy, tokenizer, bpe, llm-core, skills]
skill_level: EXPERT
author: Andrej Karpathy (Refactored for DirtyNest)
---

# Karpathy Skill: Byte-Pair Encoding (BPE) Tokenizer

## Mental Model
Language models do not process text; they process integer IDs. **BPE** starts from raw UTF-8 bytes (vocabulary size 256) and iteratively merges the most frequent consecutive pairs to build a compact vocabulary.

### Core Algorithmic Loop (Python Implementation)
```python
def get_pair_stats(vocab_ids):
    counts = {}
    for pair in zip(vocab_ids, vocab_ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts

def merge_vocab(vocab_ids, pair, new_token_id):
    new_ids = []
    i = 0
    while i < len(vocab_ids):
        if i < len(vocab_ids) - 1 and (vocab_ids[i], vocab_ids[i+1]) == pair:
            new_ids.append(new_token_id)
            i += 2
        else:
            new_ids.append(vocab_ids[i])
            i += 1
    return new_ids
```

## Key Takeaways
1. **Vocabulary Ceiling**: Standard GPT-4/Claude tokenizers use ~100k tokens.
2. **Byte Fallback**: Ensuring byte-level encoding prevents out-of-vocabulary (`<UNK>`) errors.
3. Connected architectural concepts: [[Autoresearch Autonomous Agent Loop]] and [[Hermes Control Room & Agent Swarm]].
