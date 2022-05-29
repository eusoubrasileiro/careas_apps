#!/bin/bash
# to run ansible from another machine and not ssh default to current user
# first user:passwd orangepi:orangepi become pass same for start
ansible-playbook orangepi.yaml --user orangepi --ask-pass --ask-become-pass
