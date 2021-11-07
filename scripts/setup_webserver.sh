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

authbind  gunicorn -w 8 --certfile certs/fullchain.pem --keyfile certs/privkey.pem --bind 0.0.0.0:443  wsgi:app 

# service
# sudo chmod 744 ~/motion_server_nvr/run_motion_nvr.sh
# sudo cp ~/motion_server_nvr/pc_config/motion_nvr.service /etc/systemd/system/
# sudo chmod 664 /etc/systemd/system/motion_nvr.service
# sudo systemctl daemon-reload
# sudo systemctl enable motion_nvr
# sudo systemctl start motion_nvr


# sudo ufw allow 5000 defaults to this port
# run in production
# gunicorn --bind 0.0.0.0:5000 wsgi:app

# namecheap dynamic dns
# https://www.namecheap.com/support/knowledgebase/article.aspx/5/11/are-there-any-alternate-dynamic-dns-clients/
# apt-get install ddclient
