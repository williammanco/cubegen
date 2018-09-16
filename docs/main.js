// Heavily based on https://github.com/TimvanScherpenzeel/binpacker-loader

// Configuration
const binpackFilepath = '../output/green_point_park_4k_faces.binpack';

// Utilities
function createWebWorkerInstance(content) {
  const URL = window.URL || window.webkitURL;

  if (
    URL === undefined
    || window.Blob === undefined
    || window.Worker === undefined
    || content === undefined
  ) {
    return false;
  }

  const blob = new Blob([content]);
  const oURL = URL.createObjectURL(blob);
  const worker = new Worker(oURL);

  URL.revokeObjectURL(oURL);

  return worker;
}

// Webworker
const binpackLoader = binpackPath => `
    const radiancePattern = '#\\?RADIANCE';
    const commentPattern = '#.*';
    const exposurePattern = 'EXPOSURE=\\s*([0-9]*[.][0-9]*)';
    const formatPattern = 'FORMAT=32-bit_rle_rgbe';
    const widthHeightPattern = '-Y ([0-9]+) \\\\+X ([0-9]+)';

    function readPixelsRawRLE(buffer, data, offset, fileOffset, scanlineWidth, numScanlines) {
        const rgbe = new Array(4);
        let scanlineBuffer = null;
        let ptr;
        let ptrEnd;
        let count;
        const buf = new Array(2);
        const bufferLength = buffer.length;

        function readBuf(buf) {
            let bytesRead = 0;
            do {
                buf[bytesRead++] = buffer[fileOffset];
            } while(++fileOffset < bufferLength && bytesRead < buf.length);
            return bytesRead;
        }

        function readBufOffset(buf, offset, length) {
            let bytesRead = 0;
            do {
                buf[offset + bytesRead++] = buffer[fileOffset];
            } while(++fileOffset < bufferLength && bytesRead < length);
            return bytesRead;
        }

        function readPixelsRaw(buffer, data, offset, numpixels) {
            const numExpected = 4 * numpixels;
            const numRead = readBufOffset(data, offset, numExpected);
        }

        while (numScanlines > 0) {
            if ((rgbe[0] !== 2) || (rgbe[1] !== 2) || ((rgbe[2] & 0x80) !== 0)) {
                    // this file is not run length encoded
                data[offset++] = rgbe[0];
                data[offset++] = rgbe[1];
                data[offset++] = rgbe[2];
                data[offset++] = rgbe[3];
                readPixelsRaw(buffer, data, offset, scanlineWidth * numScanlines - 1);
                return;
            }

            if (scanlineBuffer === null) {
                scanlineBuffer = new Array(4 * scanlineWidth);
            }

            ptr = 0;
            /* read each of the four channels for the scanline into the buffer */
            for (let i = 0; i < 4; i++) {
                ptrEnd = (i + 1) * scanlineWidth;
                while(ptr < ptrEnd) {
                    if (readBuf(buf) < buf.length) {
                        throw new Error('Error reading 2-byte buffer');
                    }
                    if ((buf[0] & 0xFF) > 128) {
                        /* a run of the same value */
                        count = (buf[0] & 0xFF) - 128;
                        if ((count === 0) || (count > ptrEnd - ptr)) {
                            throw new Error('Bad scanline data');
                        }
                        while(count-- > 0) {
                            scanlineBuffer[ptr++] = buf[1];
                        }
                    } else {
                        /* a non-run */
                        count = buf[0] & 0xFF;
                        if ((count === 0) || (count > ptrEnd - ptr)) {
                            throw new Error('Bad scanline data');
                        }
                        scanlineBuffer[ptr++] = buf[1];
                        if (--count > 0) {
                            if (readBufOffset(scanlineBuffer, ptr, count) < count) {
                                throw new Error('Error reading non-run data');
                            }
                            ptr += count;
                        }
                    }
                }
            }

            /* copy byte data to output */
            for(let i = 0; i < scanlineWidth; i++) {
                data[offset + 0] = scanlineBuffer[i];
                data[offset + 1] = scanlineBuffer[i + scanlineWidth];
                data[offset + 2] = scanlineBuffer[i + 2 * scanlineWidth];
                data[offset + 3] = scanlineBuffer[i + 3 * scanlineWidth];
                offset += 4;
            }

            numScanlines--;
        }

    }

    // Returns data as floats and flipped along Y by default
    function parseHdr(buffer) {
        if (buffer instanceof ArrayBuffer) {
            buffer = new Uint8Array(buffer);
        }

        let fileOffset = 0;
        const bufferLength = buffer.length;

        const NEW_LINE = 10;

        function readLine() {
            let buf = '';
            do {
                const b = buffer[fileOffset];
                if (b === NEW_LINE) {
                    ++fileOffset;
                    break;
                }
                buf += String.fromCharCode(b);
            } while(++fileOffset < bufferLength);
            return buf;
        }

        let width = 0;
        let height = 0;
        let exposure = 1;
        const gamma = 1;
        let rle = false;

        for(let i = 0; i < 20; i++) {
            const line = readLine();
            let match;
            if (match = line.match(radiancePattern)) {
            } else if (match = line.match(formatPattern)) {
                rle = true;
            } else if (match = line.match(exposurePattern)) {
                exposure = Number(match[1]);
            } else if (match = line.match(commentPattern)) {
            } else if (match = line.match(widthHeightPattern)) {
                console.log(line);
                height = Number(match[1]);
                width = Number(match[2]);
                break;
            }
        }

        if (!rle) {
            throw new Error('File is not run length encoded!');
        }

        const data = new Uint8Array(width * height * 4);
        const scanlineWidth = width;
        const numScanlines = height;

        readPixelsRawRLE(buffer, data, 0, fileOffset, scanlineWidth, numScanlines);

        const floatData = new Float32Array(width * height * 4);
        for(let offset = 0; offset < data.length; offset += 4) {
            let r = data[offset + 0] / 255;
            let g = data[offset + 1] / 255;
            let b = data[offset + 2] / 255;
            const e = data[offset + 3];
            const f = Math.pow(2.0, e - 128.0);

            r *= f;
            g *= f;
            b *= f;

            const floatOffset = offset;

            floatData[floatOffset + 0] = r;
            floatData[floatOffset + 1] = g;
            floatData[floatOffset + 2] = b;
            floatData[floatOffset + 3] = 1.0;
        }

        return {
            shape: [width, height],
            exposure: exposure,
            gamma: gamma,
            data: floatData
        };
    }

    const BINPACKER_HEADER_MAGIC = 'BINP';
    const BINPACKER_HEADER_LENGTH = 12;
    const BINPACKER_CHUNK_TYPE_JSON = 0x4e4f534a;
    const BINPACKER_CHUNK_TYPE_BINARY = 0x004e4942;

    function fileLoader(url, responseType) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.responseType = responseType || '';
            request.onreadystatechange = () => {
                if (request.readyState !== 4) return;

                if (request.readyState === 4 && request.status === 200) {
                    resolve(request.response, request.status);
                } else {
                    reject(request.status);
                }
            };

            request.open('GET', url, true);
            request.send();
        });
    }

    const convertUint8ArrayToString = array => {
        let str = '';

        array.map(item => (str += String.fromCharCode(item)));

        return str;
    };

    fileLoader(\`${window.location.origin}${binpackPath}\`, 'arraybuffer')
        .then(data => {
            let content = null;
            let contentArray = null;
            let body = null;
            let byteOffset = null;

            let chunkIndex = 0;
            let chunkLength = 0;
            let chunkType = null;

            const headerView = new DataView(data, BINPACKER_HEADER_LENGTH);
            const header = {
                magic: convertUint8ArrayToString(new Uint8Array(data, 0, 4)),
                version: headerView.getUint32(4, true),
                length: headerView.getUint32(8, true),
            };

            if (header.magic !== BINPACKER_HEADER_MAGIC) {
                throw new Error('Unsupported Binpacker header');
            }

            const chunkView = new DataView(data, BINPACKER_HEADER_LENGTH);

            while (chunkIndex < chunkView.byteLength) {
                chunkLength = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;

                chunkType = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;

                if (chunkType === BINPACKER_CHUNK_TYPE_JSON) {
                    contentArray = new Uint8Array(
                        data,
                        BINPACKER_HEADER_LENGTH + chunkIndex,
                        chunkLength,
                    );
                    content = convertUint8ArrayToString(contentArray);
                } else if (chunkType === BINPACKER_CHUNK_TYPE_BINARY) {
                    byteOffset = BINPACKER_HEADER_LENGTH + chunkIndex;
                    body = data.slice(byteOffset, byteOffset + chunkLength);
                }

                chunkIndex += chunkLength;
            }

            if (content === null) {
                throw new Error('JSON content not found');
            }

            const jsonChunk = JSON.parse(content);
            const binaryChunk = body;

            Promise.all(
                jsonChunk.map(
                    entry =>
                        new Promise((resolve, reject) => {
                            const { name, mimeType } = entry;
                            const binary = binaryChunk.slice(entry.bufferStart, entry.bufferEnd);
                            
                            resolve({
                                name,
                                binary: parseHdr(new Uint8Array(binary)),
                                mimeType,
                            })
                        }),
                ),
            ).then((faces) => {
                faces.map((face) => {
                    console.log(face.binary)
                });

                self.postMessage({
                    faces,
                });

                self.close();
            });
        })
        .catch(error => console.error(error));
`;

// Loader
function load(binpackPath) {
  const worker = createWebWorkerInstance(`${binpackLoader(binpackPath)}`);

  worker.onmessage = (event) => {
    if (event.data.error) {
      console.error(event.data.error);
    }

    console.log(event.data);
  };
}

// Application
load(`${window.location.pathname}${binpackFilepath}`);
