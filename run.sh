#!/bin/bash

# Script to create various files for image based lighting

# Helper functions

function log () {
	echo -e "\033[36m"
	echo "#########################################################"
	echo "#### $1 "
	echo "#########################################################"
	echo -e "\033[m"
}

# Tasks

clean() {
    PREFIX=$1

	rm -rf output/${PREFIX}_dfg.png
	rm -rf output/${PREFIX}_sh_temp.txt
	rm -rf output/${PREFIX}_sh.txt
	rm -rf output/${PREFIX}_sh.js
	rm -rf output/${PREFIX}_faces.binpack
	rm -rf output/${PREFIX}
}

convertSHTextToSHJavaScript() {
    PREFIX=$1

	log "Converting spherical harmonics textfile to JavaScript version"

    # Modify a temporary file and keep the existing outputted text file
	cp output/${PREFIX}_sh.txt output/${PREFIX}_sh_temp.txt

	# Add two spaces in front of all lines, replace ( with [, ) with ] and remove trailing comma
	sed -i '' -e 's/(/[/g' -e 's/);/],/g' -e 's/^/  /' output/${PREFIX}_sh_temp.txt

	# Prepend array with export syntax to allow for easy importing in JavaScript

	# module.exports = Float32Array.from([
	#   [ 0.715154216008164,  0.750523596129484,  0.755632758209969],
	#   [-0.483666219084928, -0.497031815163200, -0.632933219336340],
	#   [-0.400305239028131, -0.380012952976089, -0.307701572177935],
	#   [-0.257008604198698, -0.243140241833225, -0.203932262370727],
	#   [ 0.278453300201378,  0.268009865292208,  0.235161043050550],
	#   [ 0.454587099887602,  0.429839937567097,  0.368455742344463],
	#   [ 0.154201891160878,  0.149757341174185,  0.109613647835982],
	#   [ 0.302443299703856,  0.288082728879045,  0.241177035091168],
	#   [-0.004275769928227, -0.000455848815188, -0.018626574489379],
	# ]);

	echo -e "module.exports = Float32Array.from([\n$(cat output/${PREFIX}_sh_temp.txt)" > output/${PREFIX}_sh.js

	# Append a closing ]); after transformation
	echo -e "]);" >> output/${PREFIX}_sh.js

	cat output/${PREFIX}_sh.js

    # Cleanup temp file
    rm -rf output/${PREFIX}_sh_temp.txt
    rm -rf output/${PREFIX}_sh.txt
}

binpackFaces() {
	PREFIX=$1

	log "Binpacking all outputted HDR faces"

	npx binpacker -i output/${PREFIX} -o output/${PREFIX}_faces.binpack

	rm -rf output/${PREFIX}
}

run() {
    PREFIX=$1
    INPUT=$2

	log "Generating various files for image based lighting"

	# Clean up any existing old files under the same prefix
	clean $PREFIX

	# Output precalculated DFG LUT
	# Output irradiance and pre-scaled base SH
	# Output HDR image mips (m0 - m8), 256x256 to 1x1
    ./bin/cmgen \
		--ibl-dfg=output/${PREFIX}_dfg.png \
		--sh-irradiance \
		--ibl-dfg-multiscatter \
		--sh-shader \
		--sh-output=output/${PREFIX}_sh.txt \
		--ibl-ld=output \
		--ibl-is-mipmap=output \
		--format=hdr $INPUT

    # Convert outputted SH to a JavaScript file that can easily be interpreted
	convertSHTextToSHJavaScript $PREFIX

	# Pack all the individual faces into a single binpack binary
	# https://www.npmjs.com/package/@timvanscherpenzeel/binpacker
	binpackFaces $PREFIX
}

# Main script

if [ "$1" = "" ]; then
  echo "Usage: $0 <input HDR file>"
  exit 1
fi

FILE_NAME=$1

run $(basename $FILE_NAME .hdr) $FILE_NAME

log "Done!"
