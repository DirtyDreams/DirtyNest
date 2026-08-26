#!/usr/bin/env python
"""Post warm greeting comments to 20 subreddits with spacing."""
import subprocess
import time
import sys

# (post_id, subreddit, greeting) — varied, warm, no copy-paste
GREETINGS = [
    ("1vx0qvi", "feethustle", "Hi there! 👋 Welcome to the community — I'm also pretty new around here and still figuring things out, but everyone's been so kind and helpful. Glad to have found this place! 🥰"),
    ("1vxvdji", "feetfinderadvice", "Hello! 💕 New here too, just saying hi and soaking up all the great advice in this group. What a lovely community to be part of! 🌸"),
    ("1ta0pyv", "feetpicselleradvice", "Hey everyone! 👋 Popping in to say hello — I'm new to selling and this thread is exactly what I needed. Thanks for having such a supportive space! 🙏"),
    ("1vz4j6u", "CamGirlProblems", "Hi all! 😊 New to the industry and just wanted to say hello to this amazing community. Reading everyone's experiences has already helped me so much. Sending good vibes! ✨"),
    ("1fs4iqy", "FeetFinderTalk", "Hello! 🌷 Just joined and wanted to introduce myself — I'm new to FeetFinder and loving how much knowledge is shared here. Happy to be part of this! 💕"),
    ("1vvkt4v", "FootFetishTalks", "Hi everyone! 👋 First time commenting — I've been lurking a while and finally wanted to say hello. Such a welcoming and respectful community here. Looking forward to getting to know folks! 🥰"),
    ("1vx5fgd", "feetpicsbuyer", "Hello! 💫 New seller here saying hi — so glad this community exists to warn newbies like me about the scams. Grateful for everyone who shares their experience! 🙏"),
    ("1vz7c7r", "feetpicsbuyerandsell", "Hey hey! 😊 Just wanted to say hello to this lovely community — I'm new and it's so nice to see such a friendly space. Excited to be here! 🌸"),
    ("1on6scw", "feetfindercom", "Hi everyone! 👋 New seller here — this guide is so helpful for beginners like me. Happy to have found this community, thank you all for being so welcoming! 💕"),
    ("1vz4kap", "selltickleandfeetvids", "Hello! 🥰 New here and just saying hi — everyone seems so friendly and supportive. Lovely to be part of this community! 🌷"),
    ("1vynurb", "feetfinderpromotions", "Hi all! 😊 Just joined and wanted to introduce myself — I'm a new FeetFinder creator. Excited to be part of this community and meet everyone! 🌸"),
    ("1vz15ca", "Feet_NSFW", "Hello! 👋 New here, just saying hi and enjoying all the content. Thanks for being such a welcoming community! 🥰"),
    ("1vz4jin", "PublicFeetPics", "Hey everyone! 💕 New to this sub and wanted to say hello — what a fun and creative community. Glad to be here! ✨"),
    ("1vyz1s0", "VerifiedFeet", "Hi! 🌷 Just joined and wanted to say hello — such a great community with amazing content. Happy to be here! 🥰"),
    ("1vz7obx", "TikTokFeet", "Hello everyone! 👋 New here, just saying hi and enjoying all the posts. Thanks for having me! 💫"),
    ("1vyvt59", "Rate_my_feet", "Hi all! 😊 New to this community — just popping in to say hello. Everyone's so friendly here! 🌸"),
    ("1vz7emz", "FeetLoversHeaven", "Hey! 🥰 New here and wanted to introduce myself — what a beautiful and welcoming community. So happy to be part of it! 💕"),
    ("1vyzvwx", "FeetCasual", "Hello! 👋 Just joined and saying hi — love the chill, friendly vibe here. Excited to be part of this community! 🌷"),
    ("1vz2j6i", "AmateurFeets", "Hi everyone! 😊 New to this sub, just wanted to say hello. What a lovely community — glad to be here! ✨"),
    ("1vyxqm0", "VIPFeet", "Hello! 💕 New here and just saying hi — such an amazing community. Happy to be part of it! 🥰"),
]

def post(pid, sub, text):
    try:
        r = subprocess.run(
            ["opencli", "reddit", "comment", pid, text, "-f", "json"],
            capture_output=True, text=True, timeout=90
        )
        ok = '"success"' in r.stdout or r.returncode == 0
        print(f"[{'OK ' if ok else 'FAIL'}] r/{sub} {pid}: {r.stdout.strip()[:120]} {r.stderr.strip()[:100]}")
        return ok
    except Exception as e:
        print(f"[ERR] r/{sub} {pid}: {e}")
        return False

if __name__ == "__main__":
    ok = 0
    fail = 0
    for i, (pid, sub, text) in enumerate(GREETINGS):
        if post(pid, sub, text):
            ok += 1
        else:
            fail += 1
        # spacing to avoid rate limits (2-3s per skill guidance)
        time.sleep(3)
    print(f"\nDONE: {ok} posted, {fail} failed")
