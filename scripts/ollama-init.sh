#!/usr/bin/env bash
# Pull default Ollama models into the dirtynest-ollama container.
# Usage: ./scripts/ollama-init.sh [model ...]
# Default model: llama3.1:8b (small, CPU-friendly). Override by passing names.
set -euo pipefail

MODELS=("${@:-llama3.1:8b}")

if ! docker compose ps ollama >/dev/null 2>&1; then
  echo "Ollama service not running. Start it first: docker compose up -d ollama" >&2
  exit 1
fi

for model in "${MODELS[@]}"; do
  echo "Pulling ${model}..."
  docker compose exec -T ollama ollama pull "${model}"
done

echo "Installed models:"
docker compose exec -T ollama ollama list
