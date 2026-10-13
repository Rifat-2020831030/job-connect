# Jobsearcher package initialization
import os
import sys

# Add package directories to path for relative imports
package_dir = os.path.dirname(os.path.abspath(__file__))
if package_dir not in sys.path:
    sys.path.insert(0, package_dir)
