#!/usr/bin/env python
"""Definitively check all 60 engagement targets for a Noir_Pedestal comment."""
import subprocess
import json
import time

# All 60 engagement target post ids in order
TARGETS = {
    "feethustle": ["1vx0qvi","1vxbs5c","1vugpni"],
    "feetfinderadvice": ["1vx7t7c","1vxdreb","1vxvdji"],
    "feetpicselleradvice": ["1ta0pyv","1t0swm3","1vz6jbn"],
    "CamGirlProblems": ["1vz4j6u","1vz3ayj","1vz8yn4"],
    "FeetFinderTalk": ["1g1wb2i","1fs4iqy","1vz5hn8"],
    "FootFetishTalks": ["1vz3djd","1vz2vzb","1vvkt4v"],
    "feetpicsbuyer": ["1vx5fgd","1vz8n16","1vz3dn2"],
    "feetpicsbuyerandsell": ["1vz7c7r","1p9c1wd","1vz227n"],
    "feetfindercom": ["1on6scw","1j3sauu","1vz9szb"],
    "selltickleandfeetvids": ["1vkkato","1vz4kap","1vz8cly"],
    "feetfinderpromotions": ["1vynurb","1vy50o5","1vxlv1o"],
    "Feet_NSFW": ["1vz15ca","1vyrnrq","1vysj81"],
    "PublicFeetPics": ["1vz4jin","1vyw918","1vyz0bw"],
    "VerifiedFeet": ["1vyz1s0","1vyuusi","1vyw7hj"],
    "TikTokFeet": ["1m2lwmp","1vz7obx","1vyopzf"],
    "Rate_my_feet": ["1vyvt59","1vz5nw0","1vz4ut7"],
    "FeetLoversHeaven": ["1vz7emz","1vysf6y","1vylxbd"],
    "FeetCasual": ["1vyzvwx","1vyqiec","1vza5k8"],
    "AmateurFeets": ["1vz2j6i","1vz7a0l","1vz0sv9"],
    "VIPFeet": ["1vyxqm0","1vyv4ht","1vz5rqt"],
}

def has_my_comment(pid):
    try:
        r = subprocess.run(["opencli.cmd","reddit","read",pid,"-f","json"],
                           capture_output=True, text=True, timeout=90, shell=False)
        d = json.loads(r.stdout)
        return any(x.get("author")=="Noir_Pedestal" and x.get("type")!="POST" for x in d)
    except Exception:
        return "UNKNOWN"

missing = []
for sub, pids in TARGETS.items():
    for pid in pids:
        present = has_my_comment(pid)
        print(f"{'OK ' if present is True else ('?? ' if present=='UNKNOWN' else 'MISS')} {sub} {pid}")
        if present is not True:
            missing.append((sub, pid))
        time.sleep(1.5)

print("\n=== MISSING/UNKNOWN ===")
for sub, pid in missing:
    print(f"  {sub}: {pid}")
print(f"total missing: {len(missing)}")
