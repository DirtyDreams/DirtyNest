#!/usr/bin/env python
"""Show actual Noir_Pedestal comment texts on suspected-duplicate threads."""
import subprocess
import json
import time

IDS = ["1vxbs5c","1vugpni","1vx7t7c","1vxdreb","1vx5fgd","1vx0qvi"]

for pid in IDS:
    try:
        r = subprocess.run(["opencli.cmd","reddit","read",pid,"-f","json"],
                           capture_output=True, text=True, timeout=90, shell=False)
        d = json.loads(r.stdout)
        mine = [x for x in d if x.get("author")=="Noir_Pedestal" and x.get("type")!="POST"]
        print(f"=== {pid}: {len(mine)} comments ===")
        for m in mine:
            print(f"  * {m.get('text','')[:130].replace(chr(10),' ')}")
    except Exception as e:
        print(f"=== {pid}: ERR {e}")
    time.sleep(2)
