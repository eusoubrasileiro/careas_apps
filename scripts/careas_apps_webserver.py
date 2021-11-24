#!/usr/bin/python3

# systemd was not made to work to call .bash .sh with two commands
# so this replaces that with two os.system with threading
from threading import Thread
import os 

def call_script_https():
    os.system(r"""cd /home/andre/careas_apps
    /usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 5 --certfile /home/andre/careas_apps/certs/fullchain.pem --keyfile /home/andre/careas_apps/certs/privkey.pem --bind 0.0.0.0:443  wsgi:app""")

def call_script_http():
    os.system(r"""cd /home/andre/careas_apps
    /usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 2 --bind 0.0.0.0:80  wsgi:app""")

t_http = Thread(target=call_script_http)
t_https = Thread(target=call_script_https)
t_http.start()
t_https.start()
t_http.join()
t_https.join()
# or /home/andre/careas_apps/pythonvenv/bin/python
# 2 workers for http  and 5 https
# /usr/bin/authbind gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 
# systemd was not made to work this way better have 2 services one for http and one for https ?
# or use nginx?

