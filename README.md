# Cubegen

`Cubegen` is a simple Bash scripting wrapper around the excellend [cmgen](https://github.com/google/filament/tree/master/tools/cmgen), an image-based lighting asset generator, included in [Filament](https://github.com/google/filament/).

`Cubegen` outputs the following files:

- A single texture with the complete mipchain of pre-filtered HDR environment images
- Spherical harmonics in a JavaScript Float32Array
- Multi-scatter DFG LUT (for split sum IBL approximation)

`cmgen` outputs prefiltered and non-prefiltered faces `[m0 - m8]` `(256x256 - 1x1)`.
By using a combination of the prefiltered and non-prefiltered face you can get a more gradual transition between the different mip levels. The outputted faces are made `seamless` through `cmgen` by duplicating a row of pixels to the bottom or a column to the right of each face that don't have an adjacent face in the image (the duplicate is taken from the adjacent face in the cubemap). This is because when accessing an image with bilinear filtering, we always overshoot to the right or bottom. This works well with cubemaps stored as a cross in memory.

https://stackoverflow.com/questions/21540520/how-to-perform-mipmapping-in-webgl
https://learnopengl.com/Advanced-OpenGL/Cubemaps
