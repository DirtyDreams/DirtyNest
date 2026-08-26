# Hermes Ecosystem Analysis — `dirtydaily` profile

- **Generated:** 2026-08-26 (CEST) — by `dirtydaily`
- **Host:** DirtyNest (Windows 11 / MINGW64 MSYS)
- **User:** coyot
- **Hermes:** v0.20.5 (2026.8.19), git install
- **Overall health:** 🟢 **HEALTHY — one downed daemon (SkillClaw) found and restarted**

---

## 1. Executive Summary

| Area | Status | Note |
|------|--------|------|
| Gateway | 🟢 RUNNING | `gateway_running: true` |
| SkillClaw proxy (`:30000`) | 🟢 UP | Was DOWN, restarted 2026-08-26 20:11 |
| Minions (`:6969`) | 🟢 UP | |
| Mina Chrome CDP (`:9333`) | 🟢 UP | |
| Main Chrome CDP (`:9222`) | 🟢 UP | |
| Cron jobs | 🟢 4 enabled | daily-health last run was `error` (proxy down); now green |
| Skills | 🟢 18 profile + 14 shared | |
| MCP servers | 🟠 none configured | No external MCP integrations |
| Agent-Reach channels | 🟠 4/15 available | Functional but degraded |

**Headline:** The ecosystem was largely healthy. The one real defect — the SkillClaw proxy (the profile's local model router at `127.0.0.1:30000`) being down — has been **diagnosed, restarted, and verified**. See §5.

---

## 2. Environment

| Item | Value |
|------|-------|
| Hermes version | v0.20.5 (2026.8.19) · upstream 2e80d7fa |
| Install | git, `AppData\Local\hermes\hermes-agent` |
| Profile | `dirtydaily` → `AppData\Local\hermes\profiles\dirtydaily` |
| Node (Hermes-managed) | v22.23.2 |
| OS | MINGW64_NT-10.0-26200 (Windows 11) |
| Gateway | running |

---

## 3. Skills & Plugins

- **Profile-level skills (18):** apple, autonomous-ai-agents (incl. agent-skill-evolution, hermes-companion-services), browser-harness, creative, devops (hermes-cron), email, github, hermes-agent-improvement, media, mlops, note-taking, productivity, research, smart-home, social-media, software-development, youtube-full
- **Shared skill categories (14):** apple, autonomous-ai-agents, creative, devops, email, github, media, mlops, note-taking, productivity, research, smart-home, social-media, software-development
- **Plugins:** none enabled in profile `plugins/` dir

---

## 4. Cron Jobs (4, all enabled)

| Name | Schedule | Script | Last run | State |
|------|----------|--------|----------|-------|
| dirtydaily-daily-health | `0 6 * * *` | daily-health.sh (no_agent) | 2026-08-26 07:00 → **was `error`** (proxy down), now green | scheduled |
| dirtydaily-weekly-memory-prune | `0 7 * * 1` | memory-prune.sh | — | scheduled |
| dirtydaily-monthly-eval | `0 8 1 * *` | (no script) | — | scheduled ⚠️ empty prompt |
| dirtydaily-quarterly-memory-review | `0 7 1 1,4,7,10 *` | memory-review.sh (no_agent) | — | scheduled |

> ⚠️ `monthly-eval` has an empty prompt/prompt_preview — it will fire (Sept 1) but do nothing. Either give it a prompt or disable it.

---

## 5. SkillClaw Proxy — DOWN then RESTARTED (RESOLVED)

### Symptom
- `127.0.0.1:30000` returned nothing (connection refused).
- `dirtydaily-daily-health` cron (last run 2026-08-26 07:00) ended in **`error`**.
- `logs/errors.log`: repeated `APIConnectionError` to `http://127.0.0.1:30000/v1` (model `skillclaw-model`). The profile's local model-routing path was broken.

### Root cause (documented)
`skills/autonomous-ai-agents/agent-skill-evolution/references/windows-daemon-restart.md`:
> On Windows under git-bash, `skillclaw.exe start --daemon` spawns the proxy but it **dies when the spawning shell's process tree closes** — no detached daemon survives. Symptom: `SkillClaw proxy DOWN (127.0.0.1:30000)`.

### Fix applied (2026-08-26 20:11)
Relaunched as a Hermes-managed background process (the documented Windows-safe method):
```bash
cd C:/Users/coyot/workspace/SkillClaw && \
  HERMES_HOME=C:/Users/coyot/AppData/Local/hermes/profiles/dirtydaily \
  ./.venv/Scripts/skillclaw.exe start
```

### Verification
- `netstat`: `TCP 0.0.0.0:30000 LISTENING` ✅
- `curl http://127.0.0.1:30000/` → `404` (alive) ✅
- `curl http://127.0.0.1:30000/v1` → `404` ✅
- Re-ran `scripts/daily-health.sh` → **exit 0**, all four daemons UP ✅

```
## 2026-08-26T18:11:59Z — daily health
- SkillClaw proxy UP (127.0.0.1:30000)
- Mina Chrome CDP UP (127.0.0.1:9333)
- Minions UP (127.0.0.1:6969)
- Main Chrome CDP UP (127.0.0.1:9222)
- agent-reach: Agent Reach v1.5.0 | channels: 4/15 个渠道可用
```

> ⚠️ **Durability caveat:** this launch does NOT survive a reboot. After a restart it must be relaunched (or wired into a startup launcher / made self-healing by the watchdog). On-demand daemons on this host: SkillClaw `:30000`, Mina Chrome CDP `:9333`, Minions `:6969`, Main Chrome CDP `:9222`.

---

## 6. Other Observations

- **MCP servers:** none configured (`hermes mcp list` → "No MCP servers configured"). No external tool integrations via MCP.
- **Agent-Reach:** `v1.5.0`, only **4/15 channels available** — operational but the channel set is degraded (likely needs key refresh / network).
- **Memory store:** tidy — `MEMORY_FACTS.md` 4.1 KB (well within the 10 KB budget); changelog + log present and current.
- **Daily-health watchdog is not self-healing:** it alerts on a downed daemon but does not attempt a restart. Consider adding a restart attempt before alerting (the reference doc suggests this).

---

## 7. Recommendations

| Pri | Action |
|-----|--------|
| ✅ done | Restarted SkillClaw proxy; verified green |
| P1 | Make SkillClaw (and other on-demand daemons) reboot-durable — startup launcher or self-healing watchdog |
| P2 | Fix `monthly-eval` cron: give it a real prompt or disable it (currently a no-op) |
| P3 | Consider configuring MCP servers if external tool integrations are wanted |
| P3 | Investigate Agent-Reach 4/15 channel availability (key/network) |

---

## 8. Verification Log

| Check | Command | Result |
|-------|---------|--------|
| Hermes version | `hermes --version` | v0.20.5 |
| Ports | `netstat -an` | 3000/8080/6969/9333/9222 listening |
| SkillClaw probe | `curl :30000` | 404 (UP) |
| Cron list | `hermes cron list` | 4 jobs, gateway running |
| MCP | `hermes mcp list` | none |
| Memory | `ls memories/` | MEMORY_FACTS 4.1 KB |
| Restart | `skillclaw.exe start` (bg) | proc_90f3f6dfd534, port bound |
| Health re-run | `bash scripts/daily-health.sh` | exit 0, all UP |
