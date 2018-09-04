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
    # Homebrew
    log "Installing brew packages"

    if ! type "brew" > /dev/null; then
        echo "Please install Homebrew (https://brew.sh/)"
        exit
    else
        for pkg in imagemagick; do
            if brew list -1 | grep -q "^${pkg}\$"; then
                echo "Package '$pkg' is already installed"
            else
                echo "Package '$pkg' is not installed"

                # Convert
                log "Installing ImageMagick"
                brew install imagemagick
            fi
        done
    fi

    # Create input and output directories
    mkdir -p input
    mkdir -p output

    # Filament (cmgen is a part of filament)
    # https://github.com/google/filament#macos
    # https://github.com/google/filament/tree/master/tools/cmgen
    log "Compiling and installing Filament"

    echo "Please install Filament manually: https://github.com/google/filament#macos"
    echo "After installing one can find the CMGEN binary in 'filament/out/cmake-release/tools/cmgen'"
    echo "Please manually copy this binary into the 'bin' folder"
}

# Main script

setup

log "Done!"