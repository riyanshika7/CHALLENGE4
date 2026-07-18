import os
import time

brain_dir = r"C:\Users\riyan\.gemini\antigravity\brain\d31d68cb-f451-425c-8b7f-6834ce4d0526"
now = time.time()

print("Searching for recently added media files:")
for root, dirs, files in os.walk(brain_dir):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(root, f)
            mtime = os.path.getmtime(path)
            # modified in the last 2 minutes
            if now - mtime < 120:
                print(f"File: {path}, Size: {os.path.getsize(path)} bytes, Modified: {time.ctime(mtime)}")
