#!/usr/bin/env python
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUN_SCRIPT_PATH = os.path.join(BASE_DIR, "_run_spiders.py")


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    result = subprocess.run([sys.executable, RUN_SCRIPT_PATH], cwd=BASE_DIR)
    sys.exit(result.returncode)
