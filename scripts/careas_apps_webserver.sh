#!/bin/bash

source /home/andre/careas_apps/pythonvenv/bin/activate
authbind  gunicorn -w 8 --certfile certs/fullchain.pem --keyfile certs/privkey.pem --bind 0.0.0.0:443  wsgi:app 
authbind  gunicorn -w 2 --bind 0.0.0.0:80  wsgi:app

