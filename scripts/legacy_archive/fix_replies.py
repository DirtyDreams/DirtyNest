#!/usr/bin/env python
"""Clean up 3 duplicate replies to Shylittle88 + reply to the 2 still-missing inbox targets.
Uses reddit-ops.mjs. Rate-limit aware: spaces writes 15s apart, retries with backoff.
Logs to replies_fix.log."""
import subprocess, time, datetime, sys, json

LOG = r"C:\Users\coyot\workspace\dirty-test\replies_fix.log"
OPS = r"C:\Users\coyot\workspace\reddit-ops"

# Duplicate "Right??" replies on Shylittle88's thread — keep p6690kx? No: keep the FIRST landed (p66ade8), delete 3.
# Wait — which to keep? All identical. Keep the earliest = p66ade8.
DUPES_TO_DELETE = ["p66hsbq", "p66e2v8", "p66blow"]

MISSING_REPLIES = [
    ("p63ixhz", "Of course! 🖤 Your menu really is so well done — the goth aesthetic is everything. Wishing you tons of lovely buyers! 🌸"),
    ("p637y9u", "Aww thank you so much, that means a lot! 🥰💕 I'd love to chat — feel free to message me here on Reddit whenever you like, or find me as Noir_Pedestal on FeetFinder too. Can't wait to talk! 🌷"),
]

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def run(args):
    try:
        r = subprocess.run(["node", "reddit-ops.mjs"] + args, cwd=OPS, capture_output=True, text=True, timeout=90)
        out = (r.stdout or r.stderr or "").strip()
        return out
    except Exception as e:
        return f"ERR {e}"

def is_ok(out):
    return '"ok": true' in out or '"ok":true' in out or '"success"' in out

def is_ratelimit(out):
    return "RATELIMIT" in out

def delete(cid):
    for attempt in range(3):
        out = run(["delete", cid])
        if is_ok(out): return True, out
        if is_ratelimit(out):
            log(f"  RATELIMIT on delete {cid} — waiting 9min")
            time.sleep(560)
            continue
        return False, out
    return False, "gave up"

def reply(nid, text):
    for attempt in range(3):
        out = run(["reply-msg", nid, text])
        if is_ok(out): return True, out
        if is_ratelimit(out):
            log(f"  RATELIMIT on reply {nid} — waiting 9min")
            time.sleep(560)
            continue
        return False, out
    return False, "gave up"

if __name__ == "__main__":
    log("=== START cleanup: delete 3 dupes ===")
    for cid in DUPES_TO_DELETE:
        ok, out = delete(cid)
        log(f"{'OK ' if ok else 'FAIL'} delete {cid}: {out[:80]}")
        time.sleep(15)

    log("=== reply to 2 missing ===")
    for nid, text in MISSING_REPLIES:
        ok, out = reply(nid, text)
        log(f"{'OK ' if ok else 'FAIL'} reply {nid}: {out[:80]}")
        time.sleep(20)

    log("=== DONE ===")
