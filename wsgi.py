import sys
path = '/home/yourusername/personal_website'
if path not in sys.path:
    sys.path.append(path)

from app import app as application