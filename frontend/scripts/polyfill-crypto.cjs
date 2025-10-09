const nodeCrypto = require('node:crypto');

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = nodeCrypto.webcrypto ? { ...nodeCrypto.webcrypto } : {};
}

if (typeof globalThis.crypto.hash !== 'function') {
  globalThis.crypto.hash = (algorithm, data, outputEncoding = 'hex') => {
    const hash = nodeCrypto.createHash(algorithm);
    if (typeof data === 'string' || Buffer.isBuffer(data)) {
      hash.update(data);
    } else if (ArrayBuffer.isView(data)) {
      hash.update(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    } else if (data instanceof ArrayBuffer) {
      hash.update(Buffer.from(data));
    } else {
      hash.update(String(data));
    }

    if (outputEncoding) {
      return hash.digest(outputEncoding);
    }
    return hash.digest();
  };
}

if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = (typedArray) => {
    if (!ArrayBuffer.isView(typedArray)) {
      throw new TypeError('Expected an array buffer view');
    }
    nodeCrypto.randomFillSync(typedArray);
    return typedArray;
  };
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = () => nodeCrypto.randomUUID();
}