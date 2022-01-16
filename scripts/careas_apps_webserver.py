#!/usr/bin/python3

import os 

def gunicorn_http():
    os.system("cd /home/andre/careas_apps \n"
    "/usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 5 "    
    "--bind 0.0.0.0:5000 --access-logfile=/home/andre/careas_apps/access_http.log "
    "--capture-output --enable-stdio-inheritance "
    "wsgi:app")

gunicorn_http()
# or /home/andre/careas_apps/pythonvenv/bin/python
# 2 workers for http  and 5 https
# /usr/bin/authbind gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 
# systemd was not made to work this way better have 2 services one for http and one for https ?
# or use nginx?

