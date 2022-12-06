(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.CBOR = factory();
  }
})(this, () => {
  const { DataItem } = require('./DataItem');
  const CBOR = (function () {
    function BinaryHex(hex) {
      this.$hex = hex;
    }
    BinaryHex.prototype = {
      length () {
        return this.$hex.length / 2;
      },
      toString (format) {
        if (!format || format === 'hex' || format === 16) return this.$hex;
        if (format === 'utf-8') {
          var encoded = '';
          for (var i = 0; i < this.$hex.length; i += 2) {
            encoded += `%${  this.$hex.substring(i, i + 2)}`;
          }
          return decodeURIComponent(encoded);
        }
        if (format === 'latin') {
          var encoded = [];
          for (var i = 0; i < this.$hex.length; i += 2) {
            encoded.push(parseInt(this.$hex.substring(i, i + 2), 16));
          }
          return String.fromCharCode.apply(String, encoded);
        }
        throw new Error(`Unrecognised format: ${  format}`);
      },
    };
    BinaryHex.fromLatinString = function (latinString) {
      let hex = '';
      for (let i = 0; i < latinString.length; i++) {
        let pair = latinString.charCodeAt(i).toString(16);
        if (pair.length === 1) pair = `0${  pair}`;
        hex += pair;
      }
      return new BinaryHex(hex);
    };
    BinaryHex.fromUtf8String = function (utf8String) {
      const encoded = encodeURIComponent(utf8String);
      let hex = '';
      for (let i = 0; i < encoded.length; i++) {
        if (encoded.charAt(i) === '%') {
          hex += encoded.substring(i + 1, i + 3);
          i += 2;
        } else {
          let hexPair = encoded.charCodeAt(i).toString(16);
          if (hexPair.length < 2) hexPair = `0${  hexPair}`;
          hex += hexPair;
        }
      }
      return new BinaryHex(hex);
    };

    const semanticEncoders = [];
    const semanticDecoders = {};

    const notImplemented = function (label) {
      return function () {
        throw new Error(`${label  } not implemented`);
      };
    };

    function Reader() {}
    Reader.prototype = {
      peekByte: notImplemented('peekByte'),
      readByte: notImplemented('readByte'),
      readChunk: notImplemented('readChunk'),
      readFloat16 () {
        const half = this.readUint16();
        const exponent = (half & 0x7fff) >> 10;
        const mantissa = half & 0x3ff;
        const negative = half & 0x8000;
        if (exponent === 0x1f) {
          if (mantissa === 0) {
            return negative ? -Infinity : Infinity;
          }
          return NaN;
        }
        const magnitude = exponent
          ? 2**(exponent - 25) * (1024 + mantissa)
          : 2**-24 * mantissa;
        return negative ? -magnitude : magnitude;
      },
      readFloat32 () {
        const intValue = this.readUint32();
        const exponent = (intValue & 0x7fffffff) >> 23;
        const mantissa = intValue & 0x7fffff;
        const negative = intValue & 0x80000000;
        if (exponent === 0xff) {
          if (mantissa === 0) {
            return negative ? -Infinity : Infinity;
          }
          return NaN;
        }
        const magnitude = exponent
          ? 2**(exponent - 23 - 127) * (8388608 + mantissa)
          : 2**(-23 - 126) * mantissa;
        return negative ? -magnitude : magnitude;
      },
      readFloat64 () {
        const int1 = this.readUint32();
          const int2 = this.readUint32();
        const exponent = (int1 >> 20) & 0x7ff;
        const mantissa = (int1 & 0xfffff) * 4294967296 + int2;
        const negative = int1 & 0x80000000;
        if (exponent === 0x7ff) {
          if (mantissa === 0) {
            return negative ? -Infinity : Infinity;
          }
          return NaN;
        }
        const magnitude = exponent
          ? 2**(exponent - 52 - 1023) * (4503599627370496 + mantissa)
          : 2**(-52 - 1022) * mantissa;
        return negative ? -magnitude : magnitude;
      },
      readUint16 () {
        return this.readByte() * 256 + this.readByte();
      },
      readUint32 () {
        return this.readUint16() * 65536 + this.readUint16();
      },
      readUint64 () {
        return this.readUint32() * 4294967296 + this.readUint32();
      },
    };
    function Writer() {}
    Writer.prototype = {
      writeByte: notImplemented('writeByte'),
      result: notImplemented('result'),
      writeFloat16: notImplemented('writeFloat16'),
      writeFloat32: notImplemented('writeFloat32'),
      writeFloat64: notImplemented('writeFloat64'),
      writeUint16 (value) {
        this.writeByte((value >> 8) & 0xff);
        this.writeByte(value & 0xff);
      },
      writeUint32 (value) {
        this.writeUint16((value >> 16) & 0xffff);
        this.writeUint16(value & 0xffff);
      },
      writeUint64 (value) {
        if (value >= 9007199254740992 || value <= -9007199254740992) {
          throw new Error(
            `Cannot encode Uint64 of: ${ 
              value 
              } magnitude to big (floating point errors)`,
          );
        }
        this.writeUint32(Math.floor(value / 4294967296));
        this.writeUint32(value % 4294967296);
      },
      writeString: notImplemented('writeString'),
      canWriteBinary (chunk) {
        return false;
      },
      writeBinary: notImplemented('writeChunk'),
    };

    function readHeaderRaw(reader) {
      const firstByte = reader.readByte();
      const majorType = firstByte >> 5;
        const value = firstByte & 0x1f;
      return { type: majorType, value };
    }

    function valueFromHeader(header, reader) {
      const {value} = header;
      if (value < 24) {
        return value;
      } if (value == 24) {
        return reader.readByte();
      } if (value == 25) {
        return reader.readUint16();
      } if (value == 26) {
        return reader.readUint32();
      } if (value == 27) {
        return reader.readUint64();
      } if (value == 31) {
        // special value for non-terminating arrays/objects
        return null;
      }
      notImplemented(`Additional info: ${  value}`)();
    }

    function writeHeaderRaw(type, value, writer) {
      writer.writeByte((type << 5) | value);
    }

    function writeHeader(type, value, writer) {
      const firstByte = type << 5;
      if (value < 24) {
        writer.writeByte(firstByte | value);
      } else if (value < 256) {
        writer.writeByte(firstByte | 24);
        writer.writeByte(value);
      } else if (value < 65536) {
        writer.writeByte(firstByte | 25);
        writer.writeUint16(value);
      } else if (value < 4294967296) {
        writer.writeByte(firstByte | 26);
        writer.writeUint32(value);
      } else {
        writer.writeByte(firstByte | 27);
        writer.writeUint64(value);
      }
    }

    const stopCode = new Error(); // Just a unique object, that won't compare strictly equal to anything else

    function decodeReader(reader) {
      const header = readHeaderRaw(reader);
      switch (header.type) {
        case 0:
          return valueFromHeader(header, reader);
        case 1:
          return -1 - valueFromHeader(header, reader);
        case 2:
          return reader.readChunk(valueFromHeader(header, reader));
        case 3:
          var buffer = reader.readChunk(valueFromHeader(header, reader));
          return buffer.toString('utf-8');
        case 4:
        case 5:
          var arrayLength = valueFromHeader(header, reader);
          var result = [];
          if (arrayLength !== null) {
            if (header.type === 5) {
              arrayLength *= 2;
            }
            for (var i = 0; i < arrayLength; i++) {
              result[i] = decodeReader(reader);
            }
          } else {
            let item;
            while ((item = decodeReader(reader)) !== stopCode) {
              result.push(item);
            }
          }
          if (header.type === 5) {
            const objResult = {};
            for (var i = 0; i < result.length; i += 2) {
              objResult[result[i]] = result[i + 1];
            }
            return objResult;
          } 
            return result;
          
        case 6:
          var tag = valueFromHeader(header, reader);
          var decoder = semanticDecoders[tag];
          var result = decodeReader(reader);
          return decoder ? decoder(result) : result;
        case 7:
          if (header.value === 25) {
            return reader.readFloat16();
          } if (header.value === 26) {
            return reader.readFloat32();
          } if (header.value === 27) {
            return reader.readFloat64();
          }
          switch (valueFromHeader(header, reader)) {
            case 20:
              return false;
            case 21:
              return true;
            case 22:
              return null;
            case 23:
              return undefined;
            case null:
              return stopCode;
            default:
              throw new Error(`Unknown fixed value: ${  header.value}`);
          }
        default:
          throw new Error(`Unsupported header: ${  JSON.stringify(header)}`);
      }
      throw new Error('not implemented yet');
    }

    function encodeWriter(data, writer) {
      for (var i = 0; i < semanticEncoders.length; i++) {
        const replacement = semanticEncoders[i].fn(data);
        if (replacement !== undefined) {
          writeHeader(6, semanticEncoders[i].tag, writer);
          return encodeWriter(replacement, writer);
        }
      }

      if (data && typeof data.toCBOR === 'function') {
        data = data.toCBOR();
      }

      if (data === false) {
        writeHeader(7, 20, writer);
      } else if (data === true) {
        writeHeader(7, 21, writer);
      } else if (data === null) {
        writeHeader(7, 22, writer);
      } else if (data === undefined) {
        writeHeader(7, 23, writer);
      } else if (typeof data === 'number') {
        if (
          Math.floor(data) === data &&
          data < 9007199254740992 &&
          data > -9007199254740992
        ) {
          // Integer
          if (data < 0) {
            writeHeader(1, -1 - data, writer);
          } else {
            writeHeader(0, data, writer);
          }
        } else {
          writeHeaderRaw(7, 27, writer);
          writer.writeFloat64(data);
        }
      } else if (typeof data === 'string') {
        writer.writeString(data, (length) => {
          writeHeader(3, length, writer);
        });
      } else if (writer.canWriteBinary(data)) {
        writer.writeBinary(data, (length) => {
          writeHeader(2, length, writer);
        });
      } else if (typeof data === 'object') {
        if (api.config.useToJSON && typeof data.toJSON === 'function') {
          data = data.toJSON();
        }
        if (Array.isArray(data)) {
          writeHeader(4, data.length, writer);
          for (var i = 0; i < data.length; i++) {
            encodeWriter(data[i], writer);
          }
        } else {
          const keys = Object.keys(data);
          writeHeader(5, keys.length, writer);
          for (var i = 0; i < keys.length; i++) {
            const number = parseInt(keys[i]);
            if (isNaN(number)) {
              encodeWriter(keys[i], writer);
              encodeWriter(data[keys[i]], writer);
            } else {
              encodeWriter(number, writer);
              encodeWriter(data[keys[i]], writer);
            }
          }
        }
      } else {
        throw new Error(`CBOR encoding not supported: ${  data}`);
      }
    }

    const readerFunctions = [];
    const writerFunctions = [];

    var api = {
      config: {
        useToJSON: true,
      },
      addWriter (format, writerFunction) {
        if (typeof format === 'string') {
          writerFunctions.push((f) => {
            if (format === f) return writerFunction(f);
          });
        } else {
          writerFunctions.push(format);
        }
      },
      addReader (format, readerFunction) {
        if (typeof format === 'string') {
          readerFunctions.push((data, f) => {
            if (format === f) return readerFunction(data, f);
          });
        } else {
          readerFunctions.push(format);
        }
      },
      encode (data, format) {
        for (let i = 0; i < writerFunctions.length; i++) {
          const func = writerFunctions[i];
          const writer = func(format);
          if (writer) {
            encodeWriter(data, writer);
            return writer.result();
          }
        }
        throw new Error(`Unsupported output format: ${  format}`);
      },
      // DataItem: {getData: () => any}
      encodeDataItem (data, format) {
        for (let i = 0; i < writerFunctions.length; i++) {
          const func = writerFunctions[i];
          const writer = func(format);
          if (writer) {
            if (data.getTag() !== undefined) {
              encodeWriter(data, writer);
              return writer.result();
            } 
              encodeWriter(data.getData(), writer);
              return writer.result();
            
          }
        }
        throw new Error(`Unsupported output format: ${  format}`);
      },
      decode (data, format) {
        for (let i = 0; i < readerFunctions.length; i++) {
          const func = readerFunctions[i];
          const reader = func(data, format);
          if (reader) {
            return decodeReader(reader);
          }
        }
        throw new Error(`Unsupported input format: ${  format}`);
      },
      decodeToDataItem (data, format) {
        for (let i = 0; i < readerFunctions.length; i++) {
          const func = readerFunctions[i];
          const reader = func(data, format);
          if (reader) {
            const result = decodeReader(reader);
            if (result instanceof DataItem) {
              return result;
            } 
              return new DataItem(result);
            
          }
        }
        throw new Error(`Unsupported input format: ${  format}`);
      },
      addSemanticEncode (tag, fn) {
        if (typeof tag !== 'number' || tag % 1 !== 0 || tag < 0) {
          throw new Error('Tag must be a positive integer');
        }
        semanticEncoders.push({ tag, fn });
        return this;
      },
      addSemanticDecode (tag, fn) {
        if (typeof tag !== 'number' || tag % 1 !== 0 || tag < 0) {
          throw new Error('Tag must be a positive integer');
        }
        semanticDecoders[tag] = fn;
        return this;
      },
    };

    /** Node.js Buffers * */
    function BufferReader(buffer) {
      this.buffer = buffer;
      this.pos = 0;
    }
    BufferReader.prototype = Object.create(Reader.prototype);
    BufferReader.prototype.peekByte = function () {
      return this.buffer[this.pos];
    };
    BufferReader.prototype.readByte = function () {
      return this.buffer[this.pos++];
    };
    BufferReader.prototype.readUint16 = function () {
      const result = this.buffer.readUInt16BE(this.pos);
      this.pos += 2;
      return result;
    };
    BufferReader.prototype.readUint32 = function () {
      const result = this.buffer.readUInt32BE(this.pos);
      this.pos += 4;
      return result;
    };
    BufferReader.prototype.readFloat32 = function () {
      const result = this.buffer.readFloatBE(this.pos);
      this.pos += 4;
      return result;
    };
    BufferReader.prototype.readFloat64 = function () {
      const result = this.buffer.readDoubleBE(this.pos);
      this.pos += 8;
      return result;
    };
    BufferReader.prototype.readChunk = function (length) {
      const result = Buffer.alloc(length);
      this.buffer.copy(result, 0, this.pos, (this.pos += length));
      return result;
    };

    function BufferWriter(stringFormat) {
      this.byteLength = 0;
      this.defaultBufferLength = 16384; // 16k
      this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
      this.latestBufferOffset = 0;
      this.completeBuffers = [];
      this.stringFormat = stringFormat;
    }
    BufferWriter.prototype = Object.create(Writer.prototype);
    BufferWriter.prototype.writeByte = function (value) {
      this.latestBuffer[this.latestBufferOffset++] = value;
      if (this.latestBufferOffset >= this.latestBuffer.length) {
        this.completeBuffers.push(this.latestBuffer);
        this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
        this.latestBufferOffset = 0;
      }
      this.byteLength++;
    };
    BufferWriter.prototype.writeFloat32 = function (value) {
      const buffer = Buffer.alloc(4);
      buffer.writeFloatBE(value, 0);
      this.writeBuffer(buffer);
    };
    BufferWriter.prototype.writeFloat64 = function (value) {
      const buffer = Buffer.alloc(8);
      buffer.writeDoubleBE(value, 0);
      this.writeBuffer(buffer);
    };
    BufferWriter.prototype.writeString = function (string, lengthFunc) {
      const buffer = Buffer.from(string, 'utf-8');
      lengthFunc(buffer.length);
      this.writeBuffer(buffer);
    };
    BufferWriter.prototype.canWriteBinary = function (data) {
      return data instanceof Buffer;
    };
    BufferWriter.prototype.writeBinary = function (buffer, lengthFunc) {
      lengthFunc(buffer.length);
      this.writeBuffer(buffer);
    };
    BufferWriter.prototype.writeBuffer = function (chunk) {
      if (!(chunk instanceof Buffer))
        throw new TypeError('BufferWriter only accepts Buffers');
      if (!this.latestBufferOffset) {
        this.completeBuffers.push(chunk);
      } else if (
        this.latestBuffer.length - this.latestBufferOffset >=
        chunk.length
      ) {
        chunk.copy(this.latestBuffer, this.latestBufferOffset);
        this.latestBufferOffset += chunk.length;
        if (this.latestBufferOffset >= this.latestBuffer.length) {
          this.completeBuffers.push(this.latestBuffer);
          this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
          this.latestBufferOffset = 0;
        }
      } else {
        this.completeBuffers.push(
          this.latestBuffer.slice(0, this.latestBufferOffset),
        );
        this.completeBuffers.push(chunk);
        this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
        this.latestBufferOffset = 0;
      }
      this.byteLength += chunk.length;
    };
    BufferWriter.prototype.result = function () {
      // Copies them all into a single Buffer
      const result = Buffer.alloc(this.byteLength);
      let offset = 0;
      for (let i = 0; i < this.completeBuffers.length; i++) {
        const buffer = this.completeBuffers[i];
        buffer.copy(result, offset, 0, buffer.length);
        offset += buffer.length;
      }
      if (this.latestBufferOffset) {
        this.latestBuffer.copy(result, offset, 0, this.latestBufferOffset);
      }

      if (this.stringFormat) return result.toString(this.stringFormat);
      return result;
    };

    if (typeof Buffer === 'function') {
      api.addReader((data, format) => {
        if (data instanceof Buffer) {
          return new BufferReader(data);
        }
        if (format === 'hex' || format === 'base64') {
          const buffer = Buffer.from(data, format);
          return new BufferReader(buffer);
        }
      });
      api.addWriter((format) => {
        if (!format || format === 'buffer') {
          return new BufferWriter();
        } if (format === 'hex' || format === 'base64') {
          return new BufferWriter(format);
        }
      });
    }

    /** Hex-encoding (and Latin1) for browser * */
    function HexReader(hex) {
      this.hex = hex;
      this.pos = 0;
    }
    HexReader.prototype = Object.create(Reader.prototype);
    HexReader.prototype.peekByte = function () {
      const pair = this.hex.substring(this.pos, 2);
      return parseInt(pair, 16);
    };
    HexReader.prototype.readByte = function () {
      const pair = this.hex.substring(this.pos, this.pos + 2);
      this.pos += 2;
      return parseInt(pair, 16);
    };
    HexReader.prototype.readChunk = function (length) {
      const hex = this.hex.substring(this.pos, this.pos + length * 2);
      this.pos += length * 2;
      if (typeof Buffer === 'function') return Buffer.from(hex, 'hex');
      return new BinaryHex(hex);
    };

    function HexWriter(finalFormat) {
      this.$hex = '';
      this.finalFormat = finalFormat || 'hex';
    }
    HexWriter.prototype = Object.create(Writer.prototype);
    HexWriter.prototype.writeByte = function (value) {
      if (value < 0 || value > 255)
        throw new Error(`Byte value out of range: ${  value}`);
      let hex = value.toString(16);
      if (hex.length == 1) {
        hex = `0${  hex}`;
      }
      this.$hex += hex;
    };
    HexWriter.prototype.canWriteBinary = function (chunk) {
      return (
        chunk instanceof BinaryHex ||
        (typeof Buffer === 'function' && chunk instanceof Buffer)
      );
    };
    HexWriter.prototype.writeBinary = function (chunk, lengthFunction) {
      if (chunk instanceof BinaryHex) {
        lengthFunction(chunk.length());
        this.$hex += chunk.$hex;
      } else if (typeof Buffer === 'function' && chunk instanceof Buffer) {
        lengthFunction(chunk.length);
        this.$hex += chunk.toString('hex');
      } else {
        throw new TypeError('HexWriter only accepts BinaryHex or Buffers');
      }
    };
    HexWriter.prototype.result = function () {
      if (this.finalFormat === 'buffer' && typeof Buffer === 'function') {
        return Buffer.from(this.$hex, 'hex');
      }
      return new BinaryHex(this.$hex).toString(this.finalFormat);
    };
    HexWriter.prototype.writeString = function (string, lengthFunction) {
      const buffer = BinaryHex.fromUtf8String(string);
      lengthFunction(buffer.length());
      this.$hex += buffer.$hex;
    };

    api.addReader((data, format) => {
      if (data instanceof BinaryHex || data.$hex) {
        return new HexReader(data.$hex);
      }
      if (format === 'hex') {
        return new HexReader(data);
      }
    });
    api.addWriter((format) => {
      if (format === 'hex') {
        return new HexWriter();
      }
    });

    return api;
  })();

  CBOR.addSemanticEncode(0, (data) => {
    if (data instanceof Date) {
      return data.toISOString();
    }
  })
    .addSemanticDecode(0, (isoString) => new Date(isoString))
    .addSemanticDecode(1, (isoString) => new Date(isoString));

  return CBOR;
});
