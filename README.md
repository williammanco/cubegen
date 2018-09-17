# Cubegen

A Bash scripting wrapper around [cmgen](https://github.com/google/filament/tree/master/tools/cmgen), an image-based lighting asset generator, included in [Filament](https://github.com/google/filament/).

`Cubegen` outputs the following files:

- [A single `.binpack` file with the complete mipchain of pre-filtered and non-prefiltered HDR environment images](output/green_point_park_4k_faces.binpack).
- [Pre-scaled spherical harmonics in a single JavaScript Float32Array](output/green_point_park_4k_sh.js).
- [A multi-scatter DFG LUT (for split sum IBL approximation)](output/green_point_park_4k_dfg.png).

`cmgen` outputs both prefiltered and non-prefiltered HDR faces `mips [m0 - m8]` `(256x256 - 1x1)`. By using a combination of the prefiltered and non-prefiltered face you can get a more gradual transition between the different mip levels. The outputted faces are made seamless through `cmgen` by duplicating a row of pixels to the bottom or a column to the right of each face that don't have an adjacent face in the image (the duplicate is taken from the adjacent face in the cubemap). This is because when accessing an image with bilinear filtering, we always overshoot to the right or bottom. This technique works well with cubemaps stored as a cross in memory.

All HDR faces are packed in a single `.binpack` file. `Binpacking` is an efficient way of packing textures without the downsides of texture atlases. For more information please refer to the [Binpack documentation](https://github.com/timvanscherpenzeel/binpacker). The `.binpack` file can efficiently be loaded and parsed in a web worker. An example implementation can be found in [main.js](main.js).

## Demo

[Live demo](https://timvanscherpenzeel.github.io/cubegen/)

## Installation

`Cubegen` does not ship the `cmgen` binary due to licence concerns and seeing as the Filament is in active development it would be good to keep up to date with the latest changes.

Automatically set up for MacOS:

```sh
$ ./setup_macos.sh
```

Or please follow the following instructions:

Install `Node.js` and install `node_modules` using `npm`.

```sh
$ npm install
```

Create an `input`, `output` and `bin` directory in the root of the project.

Download the latest stable release or nightly build from [Filament](https://github.com/google/filament) and move the `cmgen` binary from `./bin/filament/bin/cmgen` in `Filament` to `bin` in this project.

## Usage

```sh
$ ./run.sh <input>
```

## Resources

- [Filament](https://github.com/google/filament)
- [Filament documentation](https://google.github.io/filament/Filament.md.html)
- [Real Shading in Unreal Engine 4](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_slides.pdf)
- [Diffuse irradiance](https://learnopengl.com/PBR/IBL/Diffuse-irradiance)
- [Specular IBL](https://learnopengl.com/PBR/IBL/Specular-IBL)
- [HDR Image-Based Lighting on the Web](https://webglinsights.github.io/downloads/WebGL-Insights-Chapter-16.pdf)
- [Image-Based Lighting](http://ict.usc.edu/pubs/Image-Based%20Lighting.pdf)

A very good resource for free CC0 HDRI's is [https://hdrihaven.com/](https://hdrihaven.com/).

## Licence

`cubegen` is released under the [MIT licence](https://raw.githubusercontent.com/TimvanScherpenzeel/cubegen/master/LICENSE). The included HDR image has been downloaded from [HDRI Haven](https://hdrihaven.com/p/license.php) and is released under the CC0 licence.
