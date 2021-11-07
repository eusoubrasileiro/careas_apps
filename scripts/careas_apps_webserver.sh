#!/bin/bash

source /home/andre/careas_apps/pythonvenv/bin/activate
# stdout and stderr to trash since syslog will get logs
# 8 workers for https
authbind  gunicorn -w 8 --certfile certs/fullchain.pem --keyfile certs/privkey.pem --bind 0.0.0.0:443  wsgi:app >& /dev/null
# 2 works for http  
authbind  gunicorn -w 2 --bind 0.0.0.0:80  wsgi:app >& /dev/null

