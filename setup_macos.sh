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
    UNAME=$(uname)

    if [ "$UNAME" != "Darwin" ] ; then
        echo "Currently only MacOS is supported by this automatic setup script"
        exit 1
    fi
    
    # Create input and output directories
    log "Creating 'input' and 'output' directories"

    mkdir -p input
    mkdir -p output

	# Grab the latest Filament MacOS release version (Darwin)
    log "Downloading the latest Filament release"

	FILAMENT_URL=$(curl -s https://api.github.com/repos/google/filament/releases/latest | jq -r ".assets[] | select(.name | test(\"darwin\")) | .browser_download_url")
	
    # Fetch the latest Filament MacOS release version (Darwin)
    wget $FILAMENT_URL -P bin -O ./bin/filament.tgz
    
    # Validate the retrieved tgz archive (does not check the integrity of the file)
    gzip -t ./bin/filament.tgz && echo "Filament was retrieved correctly and the archive is valid" || $(echo "Failed to retrieve Filament correctly and the archive is corrupted"; exit 1)

    # Extract the compressed archive
    tar -xvzf ./bin/filament.tgz -C bin

    log "Extracing 'cmgen' from latest Filament release"

    # Move the `cmgen` binary into in main `bin` directory
    mv ./bin/filament/bin/cmgen bin

    # Clean Filament directory and compressed directory
    rm -rf ./bin/filament
    rm -rf ./bin/filament.tgz
}

# Main script

setup

log "Done!"