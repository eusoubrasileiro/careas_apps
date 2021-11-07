#!/bin/bash
export ROOT=/home/andre/careas_apps
source $ROOT/pythonvenv/bin/activate
# 8 workers for https
cd $ROOT
authbind  gunicorn -D -w 8 --certfile $ROOT/certs/fullchain.pem --keyfile $ROOT/certs/privkey.pem --bind 0.0.0.0:443  wsgi:app 
# 2 works for http  
authbind  gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 

