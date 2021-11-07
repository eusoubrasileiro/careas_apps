#!/bin/bash
sudo apt-get install python3-venv snapd -y
cd ~/careas_apps
if [ ! -d "pythonvenv" ]; then 
    python3 -m venv pythonvenv
fi 
source pythonvenv/bin/activate
pip install -r requeriments.txt
if [ ! -d "aidbag" ]; then 
    git clone https://github.com/eusoubrasileiro/aidbag.git
fi 
cd aidbag/anm/careas-pip/
python setup.py install
cd ../../../

# to install certbot 
# https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
# create a standalone certificate port 80 must be open and domain server must pointing to this machine 
sudo certbot certonly -d careas.iambr.xyz -n --standalone  --agree-tos --email eusoubrasileiro@gmail.com
# create folder to store certificates created
if [ ! -d "~/careas_apps/certs" ]; then # only if not created yet
   mkdir "~/careas_apps/certs" 
fi
sudo cp /etc/letsencrypt/live/careas.iambr.xyz/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/careas.iambr.xyz/privkey.pem certs/
sudo chown -R andre:andre certs/

# careas_apps running by user andre
# to allow run on port 80 HTTP and 443 HTTPS  
# inside a python virtual env 
# since sudo would not work properly
# so passing access to specified user
sudo apt-get install authbind
sudo touch /etc/authbind/byport/80
sudo chmod 500 /etc/authbind/byport/80
sudo chown andre /etc/authbind/byport/80
sudo touch /etc/authbind/byport/443
sudo chmod 500 /etc/authbind/byport/443
sudo chown andre /etc/authbind/byport/443

# service still runs on my current user
sudo chmod 744 ~/scrips/careas_apps_webserver.sh
sudo cp ~/scrips/careas_apps_webserver.service /etc/systemd/system/
sudo chmod 664 /etc/systemd/system/careas_apps_webserver.service
sudo systemctl daemon-reload
sudo systemctl enable careas_apps_webserver
sudo systemctl start careas_apps_webserver

# namecheap dynamic dns
# https://www.namecheap.com/support/knowledgebase/article.aspx/5/11/are-there-any-alternate-dynamic-dns-clients/
# apt-get install ddclient
