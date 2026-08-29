#!/usr/bin/env python
"""Cross-check the 60 engagement targets against actual comment link_ids."""
import json
import re

# load the comments list (strip node 'path:' prefix)
with open("comments_list.json", encoding="utf-8") as f:
    raw = f.read()
# extract JSON after first '{'
start = raw.find('[')
data = json.loads(raw[start:])

# my 60 targets: post_id -> subreddit
TARGETS = {
    "1vx0qvi":"feethustle","1vxbs5c":"feethustle","1vugpni":"feethustle",
    "1vx7t7c":"feetfinderadvice","1vxdreb":"feetfinderadvice","1vxvdji":"feetfinderadvice",
    "1ta0pyv":"feetpicselleradvice","1t0swm3":"feetpicselleradvice","1vz6jbn":"feetpicselleradvice",
    "1vz4j6u":"CamGirlProblems","1vz3ayj":"CamGirlProblems","1vz8yn4":"CamGirlProblems",
    "1g1wb2i":"FeetFinderTalk","1fs4iqy":"FeetFinderTalk","1vz5hn8":"FeetFinderTalk",
    "1vz3djd":"FootFetishTalks","1vz2vzb":"FootFetishTalks","1vvkt4v":"FootFetishTalks",
    "1vx5fgd":"feetpicsbuyer","1vz8n16":"feetpicsbuyer","1vz3dn2":"feetpicsbuyer",
    "1vz7c7r":"feetpicsbuyerandsell","1p9c1wd":"feetpicsbuyerandsell","1vz227n":"feetpicsbuyerandsell",
    "1on6scw":"feetfindercom","1j3sauu":"feetfindercom","1vz9szb":"feetfindercom",
    "1vkkato":"selltickleandfeetvids","1vz4kap":"selltickleandfeetvids","1vz8cly":"selltickleandfeetvids",
    "1vynurb":"feetfinderpromotions","1vy50o5":"feetfinderpromotions","1vxlv1o":"feetfinderpromotions",
    "1vz15ca":"Feet_NSFW","1vyrnrq":"Feet_NSFW","1vysj81":"Feet_NSFW",
    "1vz4jin":"PublicFeetPics","1vyw918":"PublicFeetPics","1vyz0bw":"PublicFeetPics",
    "1vyz1s0":"VerifiedFeet","1vyuusi":"VerifiedFeet","1vyw7hj":"VerifiedFeet",
    "1m2lwmp":"TikTokFeet","1vz7obx":"TikTokFeet","1vyopzf":"TikTokFeet",
    "1vyvt59":"Rate_my_feet","1vz5nw0":"Rate_my_feet","1vz4ut7":"Rate_my_feet",
    "1vz7emz":"FeetLoversHeaven","1vysf6y":"FeetLoversHeaven","1vylxbd":"FeetLoversHeaven",
    "1vyzvwx":"FeetCasual","1vyqiec":"FeetCasual","1vza5k8":"FeetCasual",
    "1vz2j6i":"AmateurFeets","1vz7a0l":"AmateurFeets","1vz0sv9":"AmateurFeets",
    "1vyxqm0":"VIPFeet","1vyv4ht":"VIPFeet","1vz5rqt":"VIPFeet",
}

# build set of link_ids the account commented on
present = set()
for c in data:
    link = c.get("link")  # e.g. t3_1vx0qvi
    if link and link.startswith("t3_"):
        present.add(link[3:])

print(f"comments in listing: {len(data)}")
print(f"unique posts commented: {len(present)}")
print()
print("=== targets with NO comment ===")
missing = [(pid, sub) for pid, sub in TARGETS.items() if pid not in present]
for pid, sub in missing:
    print(f"  MISSING: {sub} {pid}")
if not missing:
    print("  NONE — all 60 targets covered!")
print()
print(f"targets covered: {len(TARGETS) - len(missing)}/{len(TARGETS)}")
