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

                            const blob = new Blob([new Uint8Array(binary)], {
                                type: mimeType,
                            });
                            
                            resolve({
                                name,
                                blob,
                                mimeType,
                            })
                        }),
                ),
            ).then((data) => {
                console.log(data);

                self.postMessage({
                    data
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
