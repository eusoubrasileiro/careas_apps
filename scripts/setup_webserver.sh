#!/bin/bash
sudo apt-get install python3.8-venv snapd authbind -y

cd ~/careas_apps
if [ ! -d ~/careas_apps/pythonvenv ]; then 
    python3 -m venv pythonvenv
fi 
source pythonvenv/bin/activate
pip install -r requeriments.txt

if [ ! -d ~/careas_apps/aidbag ]; then 
    git clone https://github.com/eusoubrasileiro/aidbag.git
fi 
cd aidbag/anm/careas-pip/
python setup.py install
cd ../../../

if [ ! -d ~/careas_apps/certs ]; then # only if not created yet
   # create folder to store certificates created
   mkdir "~/careas_apps/certs" 
   # to install certbot 
   # https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx
   sudo snap install core; sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   # create a standalone certificate port 80 must be open and domain server must pointing to this machine 
   sudo certbot certonly -d careas.iambr.xyz -n --standalone  --agree-tos --email eusoubrasileiro@gmail.com

   sudo cp /etc/letsencrypt/live/careas.iambr.xyz/fullchain.pem certs/
   sudo cp /etc/letsencrypt/live/careas.iambr.xyz/privkey.pem certs/
   sudo chown -R andre:andre certs/
fi

# careas_apps running by user andre (better control not root)
# to allow run on port 8000 (not 80 to allow nginx control) 
# HTTPS and forward will be dealt by nginx
# so passing access to specified user
sudo touch /etc/authbind/byport/8000
sudo chmod 500 /etc/authbind/byport/8000
sudo chown andre /etc/authbind/byport/8000

# service still runs on my current user
sudo systemctl stop careas_apps_webserver
sudo cp ~/careas_apps/scripts/careas_apps_webserver.service /etc/systemd/system/
sudo chmod 664 /etc/systemd/system/careas_apps_webserver.service
sudo systemctl daemon-reload
sudo systemctl enable careas_apps_webserver
sudo systemctl start careas_apps_webserver

cat ~/careas_apps/scripts/sites_nginx.conf >> /etc/nginx/sites-enabled/sites_nginx.conf

sudo systemctl restart nginx

# namecheap dynamic dns better allways on since ISP may not be reliable for home-internet service
# https://www.namecheap.com/support/knowledgebase/article.aspx/583/11/how-do-i-configure-ddclient/
# answered by ticket 
wget https://raw.githubusercontent.com/icolwell/install_scripts/master/ddclient_install.bash
bash ddclient_install.bash

#Once done, please edit the config at /etc/ddclient/ddclient.conf and restart the DDClient via this command:
sudo cp  ~/careas_apps/scripts/ddclient.conf  /etc/ddclient/
sudo service ddclient restart