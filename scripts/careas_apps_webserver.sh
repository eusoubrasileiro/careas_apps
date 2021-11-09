#!/bin/bash
export ROOT=/home/andre/careas_apps
source $ROOT/pythonvenv/bin/activate
# 8 workers for https
cd $ROOT
/usr/bin/authbind gunicorn -D -w 8 --certfile $ROOT/certs/fullchain.pem --keyfile $ROOT/certs/privkey.pem --bind 0.0.0.0:443  wsgi:app 
# 2 workers for http  
/usr/bin/authbind gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 
# systemd was not made to work this way better have 2 services one for http and one for https
# or use nginx
