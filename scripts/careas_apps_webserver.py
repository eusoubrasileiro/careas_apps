#!/usr/bin/python3

# systemd was not made to work to call .bash .sh with two commands
# so this replaces that with two os.system with threading
from threading import Thread
import os 

def gunicorn_https():
    os.system("cd /home/andre/careas_apps \n"
    "/usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 5 "
    "--certfile /home/andre/careas_apps/certs/fullchain.pem --keyfile /home/andre/careas_apps/certs/privkey.pem "
    "--bind 0.0.0.0:443 --access-logfile=/home/andre/careas_apps/access_https.log "
    "--capture-output --enable-stdio-inheritance "
    "wsgi:app")

def gunicorn_http():
    os.system("cd /home/andre/careas_apps \n"
    "/usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 5 "    
    "--bind 0.0.0.0:80 --access-logfile=/home/andre/careas_apps/access_http.log "
    "--capture-output --enable-stdio-inheritance "
    "wsgi:app")

#--access-logfile=/logs/rest.app/access.log

t_http = Thread(target=gunicorn_http)
t_https = Thread(target=gunicorn_https)
t_http.start()
t_https.start()
t_http.join()
t_https.join()
# or /home/andre/careas_apps/pythonvenv/bin/python
# 2 workers for http  and 5 https
# /usr/bin/authbind gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 
# systemd was not made to work this way better have 2 services one for http and one for https ?
# or use nginx?

