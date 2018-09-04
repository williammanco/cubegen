#!/bin/bash

# Script to install and setup the required toolchain

# Helper functions
function log () {
	echo -e "\033[36m"
	echo "#########################################################"
	echo "#### $1 "
	echo "#########################################################"
	echo -e "\033[m"
}

setup() {
    # Create input and output directories
    log "Creating 'input' and 'output' directories"

    mkdir -p input
    mkdir -p output
}

# Main script

setup

log "Done!"