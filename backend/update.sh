#!/bin/bash

# Check if py3.10 folder exists
if [ ! -d "py3.10" ]; then
  # Create a virtual environment named py3.10
  python3 -m venv py3.10
fi

# Activate the virtual environment
source py3.10/bin/activate

# Install requirements from requeriments.txt
pip install -r requeriments.txt

# Install or reinstall aidbag careas-poligonal
pip install ~/Projects/aidbag/anm/careas-pip