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

    if [ "$UNAME" != "Darwin" ]; then
        echo "Currently only MacOS is supported by this automatic setup script"
        exit 1
    fi

    # Node.js is required for the @timvanscherpenzeel/binpacker package
    node --version | grep "v" &> /dev/null

    if [ $? != 0 ]; then
        echo "Please make sure to install Node.js <https://nodejs.org/en/download/>"
        exit 1
    fi

    # Install `npm` dependencies, prefer using Yarn
    yarn --version &> /dev/null

    if [ $? == 0 ]; then 
        echo "Installing NPM packages using Yarn"
        yarn
    else 
        echo "Installing NPM packages using NPM"
        npm install --no-package-lock
    fi
    
    # Clean up any old 'cmgen' binaries
    rm -rf ./bin/cmgen

    # Create input and output directories
    log "Creating 'input' and 'output' directories"

    mkdir -p input
    mkdir -p output

    echo "Succesfully created 'input' and 'output' directories"

	# Grab the latest Filament MacOS stable release version (Darwin)
    log "Downloading the latest Filament release"

    # Latest stable release
	# FILAMENT_URL=$(curl -s https://api.github.com/repos/google/filament/releases/latest | jq -r ".assets[] | select(.name | test(\"darwin\")) | .browser_download_url")
	
    # Latest nightly release
    FILAMENT_URL=$(curl https://filament-build.storage.googleapis.com/badges/build_link_mac.html | grep -ioE "https://.*.tgz")

    # Fetch the latest Filament MacOS stable release version (Darwin)
    wget "$FILAMENT_URL" -P bin -O ./bin/filament.tgz
    
    log "Validating the downloaded compressed Filament archive"

    # Validate the retrieved tgz archive (does not check the integrity of the file)
    gzip -t ./bin/filament.tgz && echo "Filament was retrieved correctly and the archive is valid" || $(echo "Failed to retrieve Filament correctly and the archive is corrupted"; exit 1)

    log "Extracing 'cmgen' from latest Filament release"

    # Extract the compressed archive
    tar -xvzf ./bin/filament.tgz -C bin

    # Move the `cmgen` binary into in main `bin` directory
    mv ./bin/filament/bin/cmgen bin

    echo -e "\nSuccesfully extracted 'cmgen' into the 'bin' directory"

    # Clean Filament directory and compressed directory
    rm -rf ./bin/filament
    rm -rf ./bin/filament.tgz
}

# Main script

setup

log "Done!"