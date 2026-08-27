#!/usr/bin/env python
"""Retry the 3 rate-limited replies after the window closes. 4x backoff on RATELIMIT."""
import subprocess, time, datetime, sys

REPLIES = [
    ("p63kfdm", "Right?? 🙈 It's honestly one of the most exhausting parts of this work — you're definitely not alone in it. Wishing you lots of good ones who appreciate you! 💜"),
    ("p63ixhz", "Of course! 🖤 Your menu really is so well done — the goth aesthetic is everything. Wishing you tons of lovely buyers! 🌸"),
    ("p637y9u", "Aww thank you so much, that means a lot! 🥰💕 I'd love to chat — feel free to message me here on Reddit whenever you like, or find me as Noir_Pedestal on FeetFinder too. Can't wait to talk! 🌷"),
]

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(r"C:\Users\coyot\workspace\dirty-test\replies.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")

def reply(nid, text):
    try:
        r = subprocess.run(
            ["node", "reddit-ops.mjs", "reply-msg", nid, text],
            cwd=r"C:\Users\coyot\workspace\reddit-ops",
            capture_output=True, text=True, timeout=90
        )
        out = (r.stdout or r.stderr or "").strip()
        ok = '"ok": true' in out or '"ok":true' in out
        ratelimited = 'RATELIMIT' in out
        return ok, ratelimited, out[:150]
    except Exception as e:
        return False, False, str(e)

if __name__ == "__main__":
    # wait out the ~9min window (first FAIL was 10:25:34)
    log("waiting 600s for rate-limit window...")
    time.sleep(600)
    for attempt in range(4):
        pending = []
        for nid, text in REPLIES:
            ok, rl, msg = reply(nid, text)
            log(f"{'OK ' if ok else 'FAIL'} {nid}: {msg}")
            if not ok and rl:
                pending.append((nid, text))
            elif not ok:
                pending.append((nid, text))
        if not pending:
            log("ALL REPLIES POSTED")
            sys.exit(0)
        wait = 600 * (attempt + 1)
        log(f"{len(pending)} still pending — waiting {wait}s before retry")
        time.sleep(wait)
    log("GAVE UP after 4 attempts")
    sys.exit(1)
