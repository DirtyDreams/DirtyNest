#!/usr/bin/env python
"""Fetch full text of chosen topics for analysis."""
import subprocess
import json
import time

# (subreddit, post_id, title) — 3 per sub where engagement makes sense
# Skip pinned/stickied posts, skip our own promo posts.
CHOICES = {
    "feethustle": [
        ("1vx0qvi", "Is there a market for kinda ugly feet?"),
        ("1vxbs5c", "Need some help"),
        ("1vugpni", "buyer asking to get verified through tele"),
    ],
    "feetfinderadvice": [
        ("1vx7t7c", "I need advice on feetfinder pretties"),
        ("1vxvdji", "Pls some advice"),
        ("1vxdreb", "Im new... what exactly is this response?"),
    ],
    "feetpicselleradvice": [
        ("1ta0pyv", "Best Sites to Sell Feet Pics (Beginner-Friendly Guide)"),
        ("1t0swm3", "FeetFinder Review (From a Seller Perspective)"),
        ("1vz6jbn", "New Seller! 🤭"),
    ],
    "CamGirlProblems": [
        ("1vz4j6u", "Sick of customers that just want to talk"),
        ("1vz3ayj", "What have been your biggest struggles with camming?"),
        ("1vz8yn4", "Tips To Stay On From A BBW Model"),
    ],
    "FeetFinderTalk": [
        ("1g1wb2i", "15 Best Bio Ideas for FeetFinder"),
        ("1fs4iqy", "Ten Insider Tips to Attract and Keep Followers"),
        ("1vz5hn8", "What motivated you to go for a marketplace?"),
    ],
    "FootFetishTalks": [
        ("1vz3djd", "Naked while worshipping feet"),
        ("1vz2vzb", "Finally got to worship my friend's feet"),
        ("1vvl3hp", "TBD"),  # will check
    ],
    "feetpicsbuyer": [
        ("1vx5fgd", "Scams aimed at new sellers"),
        ("1vz3dn2", "Goth BBW menu post"),
        ("1vz7et1", "Dm me for content"),
    ],
    "feetpicsbuyerandsell": [
        ("1vz7c7r", "Rate my Canadian feet"),
        ("1p9c1wd", "FeetFinder Review 2025"),
        ("1vz9vs9", "My soft little feet say hello"),  # our own, engage with it
    ],
    "feetfindercom": [
        ("1on6scw", "FeetFinder Seller Guide 2025"),
        ("1j3sauu", "Buy and Sell Feet Pics at FeetFinder"),
        ("1vz9xbz", "My cute little feet are ready to meet you"),  # ours
    ],
    "selltickleandfeetvids": [
        ("1vkkato", "Become certified sellers risk-free?"),
        ("1vz7et1", "Dm me for content"),
        ("1vz4kap", "Do you like my feet nice and high"),
    ],
    "feetfinderpromotions": [
        ("1vynurb", "Overdue for a pedicure"),
        ("1vy50o5", "Cute or?"),
        ("1vz9yqk", "New on FeetFinder as Noir_Pedestal"),  # ours
    ],
    "Feet_NSFW": [
        ("1vz15ca", "Close up after gym"),
        ("1vyrnrq", "Lick my feet first"),
        ("1vz2mka", "lick my feet first before you go to my holes"),
    ],
    "PublicFeetPics": [
        ("1vz4jin", "Playing golf barefoot"),
        ("1vyw918", "Don't stare just suck my feet at the restaurant"),
        ("1vyz0bw", "You're not looking out the window are you?"),
    ],
    "VerifiedFeet": [
        ("1vyz1s0", "Chilling after a relaxing shower"),
        ("1vyuusi", "True gems do shine"),
        ("1vyw7hj", "Wouldn't mind getting them sucked while I enjoy my drink"),
    ],
    "TikTokFeet": [
        ("1m2lwmp", "New pages"),
        ("1vz7obx", "evamurati"),
        ("1vyopzf", "@tansley_lives"),
    ],
    "Rate_my_feet": [
        ("1vyvt59", "Toes or arches?"),
        ("1vz5nw0", "Rate my tops and soles from above"),
        ("1vz4ut7", "Voted cutest feet in HS"),
    ],
    "FeetLoversHeaven": [
        ("1vz7emz", "sunset pink toes"),
        ("1vysf6y", "Are you more into soles or toes?"),
        ("1vylxbd", "How do you like my feet with a white pedicure?"),
    ],
    "FeetCasual": [
        ("1vyzvwx", "If you're looking for perfection, I'm your girl"),
        ("1vyqiec", "My soles are calling out"),
        ("18kwve5", "Sellers will now be banned"),
    ],
    "AmateurFeets": [
        ("1vz2j6i", "What would you do with these post-workout feet?"),
        ("1vz7a0l", "18f nice arch and white toes"),
        ("1vyw7hj", "soles"),
    ],
    "VIPFeet": [
        ("1vyxqm0", "Lick my clean soft feet"),
        ("1vzac2c", "wld you cum on my feet"),
        ("1vyv4ht", "My soles are the real porn stars"),
    ],
}

def read_post(pid):
    try:
        r = subprocess.run(
            ["opencli.cmd", "reddit", "read", pid, "-f", "json"],
            capture_output=True, text=True, timeout=90
        )
        d = json.loads(r.stdout)
        out = []
        for item in d:
            if item.get("type") == "POST":
                out.append({"POST": (item.get("text") or "")[:800]})
            else:
                out.append({item.get("author","?"): (item.get("text") or "")[:250]})
        return out
    except Exception as e:
        return [{"ERR": str(e)}]

results = {}
for sub, choices in CHOICES.items():
    results[sub] = []
    for pid, title in choices:
        content = read_post(pid)
        results[sub].append({"id": pid, "title": title, "thread": content})
        print(f"=== {sub} :: {pid} {title[:40]}")
        # print condensed
        for c in content:
            for k, v in c.items():
                print(f"  [{k}] {v[:180].replace(chr(10),' ')}")
        print()
        time.sleep(2)

with open("topic_details.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved topic_details.json")
