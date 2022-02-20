#!/bin/bash
sudo apt-get install python3.8-venv authbind -y

cd ~/careas_apps
if [ ! -d ~/careas_apps/pythonvenv ]; then 
    python3 -m venv pythonvenv
fi 
source pythonvenv/bin/activate
pip install -r backend/requeriments.txt

if [ ! -d ~/careas_apps/aidbag ]; then 
    git clone https://github.com/eusoubrasileiro/aidbag.git
fi 
cd aidbag/anm/careas-pip/
python setup.py install
cd ../../../

if [ ! -d /etc/letsencrypt/live/careas.iambr.xyz ]; then # only if not created yet
   # https://phoenixnap.com/kb/letsencrypt-nginx
   sudo apt install certbot python3-certbot-nginx -y
   # create a standalone certificate port 80/443 must be open and domain server must pointing to this machine 
   # also server_name must be set to careas.iambr.xyz
   sudo certbot --nginx -d careas.iambr.xyz 
fi

# careas_apps running by user andre (better control not root)
# to allow run on port 8000 (not 80 to allow nginx control) 
# HTTPS and forward will be dealt by nginx
# so passing access to specified user
sudo touch /etc/authbind/byport/5000
sudo chmod 500 /etc/authbind/byport/5000
sudo chown andre /etc/authbind/byport/5000

#/usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 4 --bind 0.0.0.0:5000 main:app
# service still runs on my current user
sudo systemctl stop careas_apps_webserver
sudo cp ~/careas_apps/scripts/careas_apps_webserver.service /etc/systemd/system/
sudo chmod 664 /etc/systemd/system/careas_apps_webserver.service
sudo systemctl daemon-reload
sudo systemctl enable careas_apps_webserver
sudo systemctl start careas_apps_webserver

sudo cp ~/careas_apps/scripts/careas_apps_react.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# namecheap dynamic dns better allways on since ISP may not be reliable for home-internet service
# https://www.namecheap.com/support/knowledgebase/article.aspx/583/11/how-do-i-configure-ddclient/
# answered by ticket 
wget https://raw.githubusercontent.com/icolwell/install_scripts/master/ddclient_install.bash
bash ddclient_install.bash

#Once done, please edit the config at /etc/ddclient/ddclient.conf and restart the DDClient via this command:
sudo cp  ~/careas_apps/scripts/ddclient.conf  /etc/ddclient/
sudo service ddclient restart