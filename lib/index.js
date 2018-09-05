#!/usr/bin/env node

const PREFIX = process.argv[2];

const mipmapsAmount = Array(9)
  .fill()
  .map((_, i) => i);

const filteredMipmaps = [
  ...mipmapsAmount.map(mip => {
    return [
      `m${mip}_nx.hdr`,
      `m${mip}_ny.hdr`,
      `m${mip}_nz.hdr`,
      `m${mip}_px.hdr`,
      `m${mip}_py.hdr`,
      `m${mip}_pz.hdr`
    ];
  })
];

const mipmaps = [
  ...mipmapsAmount.map(mip => {
    return [
      `is_m${mip}_nx.hdr`,
      `is_m${mip}_ny.hdr`,
      `is_m${mip}_nz.hdr`,
      `is_m${mip}_px.hdr`,
      `is_m${mip}_py.hdr`,
      `is_m${mip}_pz.hdr`
    ];
  })
];

console.log(mipmaps);
