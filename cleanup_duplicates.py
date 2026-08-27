#!/usr/bin/env python
"""Clean up 16 redundant/duplicate comments from the engagement campaign.
Deletes: 1 retry duplicate (p63iq6d) + 15 greeting-overlap comments on posts
that already carry a substantive engagement comment.
Spacing: 12s to respect Reddit's rate limiter. Progress appended to cleanup.log."""
import subprocess, time, datetime, sys

IDS = [
    # true retry duplicate (identical text) — keep p63mrfy
    "p63iq6d",
    # greeting overlaps — the substantive engagement comment stays
    "p63d8ln", "p63d7m9", "p63d1ic", "p63d0jh", "p63czi3", "p63cygh",
    "p63cxis", "p63cwlf", "p63cvm8", "p63culn", "p63ctm1", "p63cskx",
    "p63crpb", "p63cqnu", "p63cpov",
]

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(r"C:\Users\coyot\workspace\dirty-test\cleanup.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")

def delete(cid):
    try:
        r = subprocess.run(
            ["node", "reddit-ops.mjs", "delete", cid],
            cwd=r"C:\Users\coyot\workspace\reddit-ops",
            capture_output=True, text=True, timeout=90
        )
        out = (r.stdout or r.stderr or "").strip()
        ok = '"ok": true' in out or '"ok":true' in out or '"success"' in out
        return ok, out[:120]
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    ok_n = 0
    for i, cid in enumerate(IDS):
        ok, msg = delete(cid)
        log(f"{'OK ' if ok else 'FAIL'} {cid}: {msg}")
        if ok:
            ok_n += 1
        if i < len(IDS) - 1:
            time.sleep(12)
    log(f"DONE: {ok_n}/{len(IDS)} deleted")
