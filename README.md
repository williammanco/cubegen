# Octagen

`Octagen` is a simple Bash scripting wrapper around the excellend [cmgen](https://github.com/google/filament/tree/master/tools/cmgen), an image-based lighting asset generator, included in [Filament](https://github.com/google/filament/).

`Octagen` outputs the following files:

- A single texture with the complete mipchain of octahedral mapped pre-filtered environment images
- Spherical harmonics in a JavaScript array
- multi-scatter DFG LUT (for split sum IBL approximation)
