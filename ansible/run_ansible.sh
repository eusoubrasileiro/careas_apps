#!/bin/bash
# to run ansible from another machine and not ssh default to current user
# use root:orangepi02 dont need become 
ansible-playbook orangepi02.yaml --user root --ask-pass -tags services,nfs