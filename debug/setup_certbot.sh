#!/bin/bash

if [ ! -d /etc/letsencrypt/live/careas.iambr.xyz ]; then # only if not created yet
   # https://phoenixnap.com/kb/letsencrypt-nginx
   # create a standalone certificate port 80/443 must be open and domain server 
   # must pointing to this machine - only this
   certbot --nginx -d careas.iambr.xyz --register-unsafely-without-email   
fi

# change all references /etc/nginx/nginx.conf /etc/nginx/sites-enabled/* to 
# /tmp that is ramdisks tmpfs file system with access to all users 

# finally set read-only on disk /etc/fstab
UUID=886120f4-2e32-45b2-b59b-4f5928f37137 / ext4 ro 0 0
# reboot 

# want to update anything do 
# sudo mount -o remount,rw /dev/mmcblk0p1

# TODO - FUTURE
# add usb or create partition with fdisk to set logs