#!/bin/bash
sudo apt-get update # need to get new mirrors first 
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
sudo touch /etc/authbind/byport/8000
sudo chmod 500 /etc/authbind/byport/8000
sudo chown andre /etc/authbind/byport/8000

#/usr/bin/authbind /home/andre/careas_apps/pythonvenv/bin/gunicorn -w 4 --bind 0.0.0.0:8000 main:app
# service still runs on my current user
sudo systemctl stop careas_apps_webserver
sudo cp ~/careas_apps/scripts/careas_apps_webserver.service /etc/systemd/system/
sudo chmod 664 /etc/systemd/system/careas_apps_webserver.service

# namecheap dynamic dns better allways on since ISP may not be reliable for home-internet service
# https://www.namecheap.com/support/knowledgebase/article.aspx/583/11/how-do-i-configure-ddclient/
# answered by ticket 
wget https://raw.githubusercontent.com/icolwell/install_scripts/master/ddclient_install.bash
bash ddclient_install.bash

#Once done, please edit the config at /etc/ddclient/ddclient.conf and restart the DDClient via this command:
sudo cp  ~/careas_apps/scripts/ddclient.conf  /etc/ddclient/
sudo service ddclient restart

# start nginx first 
sudo cp ~/careas_apps/scripts/careas_apps_react.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx
# start then careas-apps backend flask
sudo systemctl daemon-reload
sudo systemctl enable careas_apps_webserver
sudo systemctl start careas_apps_webserver

# MUST copy react-javascript BUILT bundle
# from /home/andre/careas_apps/frontend/build 
# from windows or any other place it was built to same folder ...

# change all references /etc/nginx/nginx.conf /etc/nginx/sites-enabled/* to 
# /tmp that is ramdisks tmpfs file system with access to all users 

# finally set read-only on disk /etc/fstab
UUID=886120f4-2e32-45b2-b59b-4f5928f37137 / ext4 ro 0 0
# reboot 

# want to update anything do 
# sudo mount -o remount,rw /dev/mmcblk0p1

# TODO - FUTURE
# add usb or create partition with fdisk to set logs