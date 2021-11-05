#!/bin/bash

source ~/careas_apps/pythonvenv/bin/activate
export FLASK_APP=main
# run in development to get changes detection and exceptions
export FLASK_ENV=development
flask run