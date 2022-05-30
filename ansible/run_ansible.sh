#!/bin/bash
# to run ansible from another machine and not ssh default to current user
# use root:orangepi dont need become 
ansible-playbook orangepi.yaml --user root --ask-pass