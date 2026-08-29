#!/usr/bin/env python
"""Post the 18 missed engagement comments with longer spacing + retries."""
import subprocess
import time

MISSING = [
    ("1vyw918", "PublicFeetPics", "Bold move at a restaurant! 😆👣 Love the playful energy — this is exactly the kind of risky-public content this sub is for. Great post! 🌸"),
    ("1vyz0bw", "PublicFeetPics", "That window shot is such a tease 😏👣 Love the composition. Really nice work — keep sharing! 💕"),
    ("1vyuusi", "VerifiedFeet", "Gorgeous toes! ✨👣 The 'true gems do shine' energy is right — you're definitely shining in this one. Beautiful post! 🌸"),
    ("1vyw7hj", "VerifiedFeet", "That's a very confident energy and I'm here for it 😏👣 Love the relaxed vibe while enjoying a drink — great content! 💕"),
    ("1m2lwmp", "TikTokFeet", "New pages popping up — love seeing the TikTok feet community grow! 👣✨ Welcome to all the new creators. Great stuff! 🌸"),
    ("1vyopzf", "TikTokFeet", "Loving this one! ✨👣 The energy is great and the content is fun. Nice post! 💕"),
    ("1vz5nw0", "Rate_my_feet", "Soles from above is such a good angle — really shows them off! 👣✨ Clean and well-shot. High marks from me! 🌸"),
    ("1vz4ut7", "Rate_my_feet", "The 'cutest feet in HS' award makes total sense 👑👣 Both toes and soles are lovely — you're flexing well. 9/10 from me! 💕"),
    ("1vysf6y", "FeetLoversHeaven", "Soles all the way for me! 😇👣 But the toes in the second pic are adorable too. Gorgeous content — thanks for sharing! 💕"),
    ("1vylxbd", "FeetLoversHeaven", "White pedicure is such a classic, and it looks stunning on you! ✨👣 Clean, elegant, beautiful. Love it! 🌸"),
    ("1vyqiec", "FeetCasual", "Those soles know what they're doing 😏👣 Great shot with a lovely casual feel. Keep it up! 🌸"),
    ("1vza5k8", "FeetCasual", "Always happy to admire! 👣✨ Lovely, clean content — such a nice relaxing vibe. Thanks for sharing! 💕"),
    ("1vz2j6i", "AmateurFeets", "Post-workout feet definitely deserve some TLC! 👣✨ They look great honestly. Love the amateur realness of this sub — nice post! 💕"),
    ("1vz7a0l", "AmateurFeets", "That arch is beautiful and the white toes are adorable! 👣🤍 Lovely amateur shot — keep sharing! 🌸"),
    ("1vz0sv9", "AmateurFeets", "They look like they've earned a massage for sure! 👣💆‍♀️ Lovely content — so soft and natural. Thanks for sharing! 💕"),
    ("1vyxqm0", "VIPFeet", "Clean and soft is exactly right — they look so well cared for! ✨👣 Gorgeous content, love the quality. Keep sharing! 💕"),
    ("1vyv4ht", "VIPFeet", "Your soles are absolutely main character energy! 👣🌟 The confidence is everything. Great content! 🌸"),
    ("1vz5rqt", "VIPFeet", "That pedicure game is STRONG — those toes are perfect! 💅👣 The caption is iconic too. Love it! 💕"),
]

def post_once(pid, sub, text):
    try:
        r = subprocess.run(
            ["opencli.cmd","reddit","comment",pid,text,"-f","json"],
            capture_output=True, text=True, timeout=90, shell=False
        )
        return '"success"' in r.stdout, (r.stdout or r.stderr).strip()[:100]
    except Exception as e:
        return False, str(e)

def post(pid, sub, text):
    for attempt in range(1, 5):
        ok, msg = post_once(pid, sub, text)
        if ok:
            print(f"[OK ] r/{sub} {pid} (attempt {attempt})", flush=True)
            return True
        print(f"[.. ] r/{sub} {pid} attempt {attempt}: {msg}", flush=True)
        time.sleep(15 * attempt)  # backoff: 15s, 30s, 45s
    print(f"[FAIL] r/{sub} {pid} after 4 attempts", flush=True)
    return False

if __name__ == "__main__":
    ok=0; fail=0
    for i, (pid, sub, text) in enumerate(MISSING):
        if post(pid, sub, text): ok+=1
        else: fail+=1
        time.sleep(12)  # longer spacing between posts
        print(f"  ...{i+1}/{len(MISSING)} done (ok={ok} fail={fail})", flush=True)
    print(f"\nDONE: {ok} posted, {fail} failed", flush=True)
