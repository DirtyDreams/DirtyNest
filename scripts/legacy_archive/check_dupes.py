#!/usr/bin/env python
"""Check which engagement comments exist and if duplicates occurred."""
import subprocess
import json
import time

# sample of post ids across the range
IDS = ["1vx0qvi","1vxbs5c","1vugpni","1vx7t7c","1vxdreb","1vxvdji","1ta0pyv","1t0swm3",
       "1vz6jbn","1vz4j6u","1vz3ayj","1vz8yn4","1g1wb2i","1fs4iqy","1vz5hn8",
       "1vz3djd","1vz2vzb","1vvkt4v","1vx5fgd","1vz8n16","1vz3dn2","1vz7c7r",
       "1p9c1wd","1vz227n","1on6scw","1j3sauu","1vz9szb","1vkkato","1vz4kap","1vz8cly"]

def count_my_comments(pid):
    try:
        r = subprocess.run(["opencli.cmd","reddit","read",pid,"-f","json"],
                           capture_output=True, text=True, timeout=90, shell=False)
        d = json.loads(r.stdout)
        mine = [x for x in d if x.get("author")=="Noir_Pedestal" and x.get("type")!="POST"]
        return len(mine)
    except Exception as e:
        return -1

for pid in IDS:
    n = count_my_comments(pid)
    print(f"{pid}: {n} Noir_Pedestal comment(s)")
    time.sleep(2)
