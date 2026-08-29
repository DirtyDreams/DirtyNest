#!/usr/bin/env python
"""Locate duplicate Noir_Pedestal comment permalinks on the 4 affected threads."""
import subprocess
import json
import time

IDS = ["1vxbs5c","1vugpni","1vx7t7c","1vxdreb"]
# Use browser? OpenCLI read doesn't give comment IDs. We'll grab permalinks from read json if present.
for pid in IDS:
    try:
        r = subprocess.run(["opencli.cmd","reddit","read",pid,"-f","json"],
                           capture_output=True, text=True, timeout=90, shell=False)
        d = json.loads(r.stdout)
        for x in d:
            if x.get("author")=="Noir_Pedestal" and x.get("type")!="POST":
                print(pid, "|", json.dumps({k:v for k,v in x.items() if k!='text'})[:300])
    except Exception as e:
        print(pid, "ERR", e)
    time.sleep(2)
