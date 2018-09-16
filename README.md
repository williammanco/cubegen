# Cubegen

A Bash scripting wrapper around [CMGEN](<(https://github.com/google/filament/tree/master/tools/cmgen)>), an image-based lighting asset generator, included in [Filament](https://github.com/google/filament/).

`Cubegen` outputs the following files:

- A single `.binpack` file with the complete mipchain of pre-filtered HDR environment images.
- Pre-scaled spherical harmonics in a single JavaScript Float32Array.
- A multi-scatter DFG LUT (for split sum IBL approximation).

`cmgen` outputs both prefiltered and non-prefiltered HDR faces `[m0 - m8]` `(256x256 - 1x1)`. By using a combination of the prefiltered and non-prefiltered face you can get a more gradual transition between the different mip levels. The outputted faces are made seamless through `cmgen` by duplicating a row of pixels to the bottom or a column to the right of each face that don't have an adjacent face in the image (the duplicate is taken from the adjacent face in the cubemap). This is because when accessing an image with bilinear filtering, we always overshoot to the right or bottom. This works well with cubemaps stored as a cross in memory.

All HDR faces are effectively packed in a single `.binpack` file. `Binpacking` is an efficient way of packing textures without the downsides of texture atlases. For more information please refer to the [Binpack documentation](https://github.com/timvanscherpenzeel/binpacker). The `.binpack` file can efficiently be loaded and parsed in a web worker. For an example please refer to [main.js](main.js).

## Demo

[Live demo](https://timvanscherpenzeel.github.io/cubegen/)

## Installation

Automatically set up for MacOS.

```sh
$ ./setup_macos.sh
```

Or please follow the following instructions:

Install `Node.js` and install `node_modules` using `npm`.

```sh
$ npm install
```

Download the latest stable release or nightly build from [Filament](https://github.com/google/filament) and add the move the `cmgen` binary from `./bin/filament/bin/cmgen` to `bin` in this project.

## Usage

```sh
$ ./run.sh <input>
```

## Resources

- [Binpacker](https://github.com/timvanscherpenzeel/binpacker)
- [Binpacker-loader](https://github.com/timvanscherpenzeel/binpacker-loader)
- [Filament](https://github.com/google/filament)
- [CMFT](https://github.com/dariomanesku/cmft)
- [Envtools - alternative to CMFT with more configuration options, the fork uses Docker](https://github.com/cedricpinson/envtools)
- [Spherical harmonics for beginners](https://dickyjim.wordpress.com/2013/09/04/spherical-harmonics-for-beginners/)
- [Diffuse irradiance](https://learnopengl.com/PBR/IBL/Diffuse-irradiance)
- [Specular IBL](https://learnopengl.com/PBR/IBL/Specular-IBL)
- [HDR Image-Based Lighting on the Web](https://webglinsights.github.io/downloads/WebGL-Insights-Chapter-16.pdf)
- [Image-Based Lighting](http://ict.usc.edu/pubs/Image-Based%20Lighting.pdf)
- [RGBM color encoding](https://graphicrants.blogspot.nl/2009/04/rgbm-color-encoding.html)
- [Pragmatic PBR HDR](http://marcinignac.com/blog/pragmatic-pbr-hdr)
- [An Efficient Representation for Irradiance Environment Maps](http://graphics.stanford.edu/papers/envmap/)
- [A Survey of Efficient Representations for Independent Unit Vectors](http://jcgt.org/published/0003/02/01/paper.pdf)
- [WebGL-based Prefiltered Mipmaped Radiance Environment Map (PMREM) generator](https://github.com/mrdoob/three.js/issues/7402)
- [Advanced WebGL - Part 3: Irradiance Environment Map](http://codeflow.org/entries/2011/apr/18/advanced-webgl-part-3-irradiance-environment-map/)
- [Real-Time Computation of Dynamic Irradiance Environment Maps](https://developer.nvidia.com/gpugems/GPUGems2/gpugems2_chapter10.html)

A very good resource for free CC0 HDRI's is [https://hdrihaven.com/](https://hdrihaven.com/).

## Licence

`cubegen` is released under the [MIT licence](https://raw.githubusercontent.com/TimvanScherpenzeel/cubegen/master/LICENSE).
