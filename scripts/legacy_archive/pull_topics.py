#!/usr/bin/env python
"""Pull 3 recent topics (with text) from 20 subreddits."""
import subprocess
import json
import time

SUBS = [
    "feethustle", "feetfinderadvice", "feetpicselleradvice", "CamGirlProblems",
    "FeetFinderTalk", "FootFetishTalks", "feetpicsbuyer", "feetpicsbuyerandsell",
    "feetfindercom", "selltickleandfeetvids", "feetfinderpromotions", "Feet_NSFW",
    "PublicFeetPics", "VerifiedFeet", "TikTokFeet", "Rate_my_feet",
    "FeetLoversHeaven", "FeetCasual", "AmateurFeets", "VIPFeet",
]

def get_posts(sub):
    try:
        r = subprocess.run(
            ["opencli.cmd", "reddit", "subreddit", sub, "-f", "json"],
            capture_output=True, text=True, timeout=90
        )
        d = json.loads(r.stdout)
        posts = d if isinstance(d, list) else d.get('posts', d)
        if isinstance(posts, dict): posts = [posts]
        return posts[:4]
    except Exception as e:
        return []

out = {}
for sub in SUBS:
    posts = get_posts(sub)
    items = []
    for p in posts:
        items.append({
            "id": p.get("id", ""),
            "title": p.get("title", ""),
            "author": p.get("author", ""),
            "score": p.get("score", 0),
            "comments": p.get("comments", 0),
            "text": (p.get("text") or "")[:600],
        })
    out[sub] = items
    print(f"{sub}: {len(items)} posts")
    time.sleep(2)

with open("topics.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print("\nSaved topics.json")
