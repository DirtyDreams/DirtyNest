#!/usr/bin/env python
"""Reply to 4 unread inbox notifications from the engagement campaign.
Warm, cute, thread-grounded, varied. 12s spacing. Log to replies.log."""
import subprocess, time, datetime

REPLIES = [
    ("p63mied", "You're so welcome!! 🥰 It's lovely to meet you too — and that name really is adorable. Wishing you lots of fun and lovely buyers on here! 💕🌷"),
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
        ok = '"ok": true' in out or '"ok":true' in out or '"success"' in out
        return ok, out[:150]
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    for i, (nid, text) in enumerate(REPLIES):
        ok, msg = reply(nid, text)
        log(f"{'OK ' if ok else 'FAIL'} {nid}: {msg}")
        if i < len(REPLIES) - 1:
            time.sleep(12)
    log("DONE")
