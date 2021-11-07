#!/bin/bash
export ROOT=/home/andre/careas_apps
source $ROOT/pythonvenv/bin/activate
# stdout and stderr to trash since syslog will get logs
# 8 workers for https
cd $ROOT
authbind  gunicorn -w 8 --certfile $ROOT/certs/fullchain.pem --keyfile $ROOT/certs/privkey.pem --bind 0.0.0.0:443  wsgi:app &> /dev/null
# 2 works for http  
authbind  gunicorn -w 2 --bind 0.0.0.0:80  wsgi:app &> /dev/null

