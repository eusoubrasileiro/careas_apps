#!/bin/bash

# systemd was not made to work to call two commands
# so let's  
# replace by a Python script with two os.system

c=`cat <<EOF
import os 
os.system(r"""source /home/andre/careas_apps/pythonvenv/bin/activate
/usr/bin/authbind gunicorn -w 5 --certfile /home/andre/careas_apps/certs/fullchain.pem --keyfile /home/andre/careas_apps/certs/privkey.pem --bind 0.0.0.0:443  wsgi:app &""") 
os.system("""source /home/andre/careas_apps/pythonvenv/bin/activate
/usr/bin/authbind gunicorn -w 2 --bind 0.0.0.0:80  wsgi:app &""")
EOF`
python3 -c "$c"

# 2 workers for http  and 5 https
# /usr/bin/authbind gunicorn -D -w 2 --bind 0.0.0.0:80  wsgi:app 
# systemd was not made to work this way better have 2 services one for http and one for https ?
# or use nginx?
