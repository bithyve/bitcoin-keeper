import { FILETYPES, HEADER_LEN } from './consts';
import { FileType, SplitOptions, SplitResult, Version } from './types';
import {
  base64ToBytes,
  encodeData,
  fileToBytes,
  hexToBytes,
  intToBase36,
  looksLikePsbt,
  validateSplitOptions,
  versionToChars,
} from './utils';

function numQRNeeded(version: Version, length: number, splitMod: number) {
  const baseCap = versionToChars(version) - HEADER_LEN;

  // adjust capacity to be a multiple of splitMod
  const adjustedCap = baseCap - (baseCap % splitMod);

  const estimatedCount = Math.ceil(length / adjustedCap);

  if (estimatedCount === 1) {
    // if it fits in one QR, we're done
    return { count: 1, perEach: length };
  }

  // the total capacity of our estimated count
  // all but the last QR need to use adjusted capacity to ensure proper split
  const estimatedCap = (estimatedCount - 1) * adjustedCap + baseCap;

  return {
    count: estimatedCap >= length ? estimatedCount : estimatedCount + 1,
    perEach: adjustedCap,
  };
}

function findBestVersion(length: number, splitMod: number, opts: Required<SplitOptions>) {
  const options: { version: Version; count: number; perEach: number }[] = [];

  for (let version = opts.minVersion; version <= opts.maxVersion; version++) {
    const { count, perEach } = numQRNeeded(version, length, splitMod);

    if (opts.minSplit <= count && count <= opts.maxSplit) {
      options.push({ version, count, perEach });
    }
  }

  if (!options.length) {
    throw new Error('Cannot make it fit');
  }

  // pick smallest number of QR, lowest version
  options.sort((a, b) => a.count - b.count || a.version - b.version);

  return options[0];
}

/**
 * Converts the input bytes into a series of QR codes, ensuring that the most efficient QR code
 * version is used.
 *
 * NOTE: When the 'Z' (Zlib) encoding is selected, it is possible that the actual used encoding
 * will be '2' (Base32) in case Zlib compression does not reduce the size of the output.
 *
 * @param raw The input bytes to split and encode.
 * @param fileType The file type to use. Refer to BBQr spec.
 *
 * @param opts An optional SplitOptions object.
 * @param opts.encoding The Encoding to use. Defaults to 'Z'.
 * @param opts.minSplit The minimum number of QR codes to use. Defaults to 1.
 * @param opts.maxSplit The maximum number of QR codes to use. Defaults to 1295.
 * @param opts.minVersion The minimum QR code version to use. Defaults to 5.
 * @param opts.maxVersion The maximum QR code version to use. Defaults to 40.
 *
 * @returns An object containing the version of the QR codes, their string parts, and the actual encoding used.
 */
export function splitQRs(
  raw: Uint8Array,
  fileType: FileType,
  opts: SplitOptions = {}
): SplitResult {
  if (!FILETYPES.has(fileType)) {
    throw new Error(`Invalid value for fileType: ${fileType}`);
  }

  const validatedOpts = validateSplitOptions(opts);

  const { encoding: actualEncoding, encoded, splitMod } = encodeData(raw, validatedOpts.encoding);

  const { version, count, perEach } = findBestVersion(encoded.length, splitMod, validatedOpts);

  const parts: string[] = [];

  for (let n = 0, offset = 0; offset < encoded.length; n++, offset += perEach) {
    parts.push(
      `B$${actualEncoding}${fileType}` +
        intToBase36(count) +
        intToBase36(n) +
        encoded.slice(offset, offset + perEach)
    );
  }

  return { version, parts, encoding: actualEncoding };
}

/**
 * Takes a given given input (Uint8Array, File, or string) and detects its FileType.
 * PSBTs and Bitcoin transactions are supported in raw binary, Base64, or hex format.
 *
 * @param input - The input to detect the FileType of.
 * @returns A Promise that resolves to an object containing the FileType and raw data.
 */
export async function detectFileType(
  input: File | Uint8Array | string
): Promise<{ fileType: FileType; raw: Uint8Array }> {
  // keep references to both raw and decoded versions of the input to run checks on
  let raw: Uint8Array | undefined = undefined;
  let decoded: string | undefined = undefined;

  if (input instanceof File) {
    // convert a File to Uint8Array so we have access to the raw bytes
    input = await fileToBytes(input);
  }

  if (input instanceof Uint8Array) {
    // we got binary, see if we recognize it
    raw = input;

    if (looksLikePsbt(input)) {
      console.debug('Detected type "P" from binary input');
      return { fileType: 'P', raw };
    }

    if (raw[0] === 0x01 || raw[0] === 0x02) {
      console.debug('Detected type "T" from binary input');
      return { fileType: 'T', raw };
    }

    // otherwise, try to decode as text (could be contents of a file)
    try {
      decoded = new TextDecoder('utf-8', { fatal: true }).decode(raw);
    } catch (err) {
      // not text, so fall back to generic binary

      console.debug('Detected type "B" from binary input');
      return { fileType: 'B', raw };
    }
  } else if (typeof input === 'string') {
    decoded = input;
  } else {
    throw new Error('Invalid input - must be a File, Uint8Array or string');
  }

  const trimmed = decoded.trim();

  if (/^70736274ff[0-9A-Fa-f]+$/.test(trimmed)) {
    // PSBT in hex format
    console.debug('Detected type "P" from hex input');

    return { fileType: 'P', raw: hexToBytes(trimmed) };
  }

  if (/^0[1,2]000000[0-9A-Fa-f]+$/.test(trimmed)) {
    // Transaction in hex format
    console.debug('Detected type "T" from hex input');
    return { fileType: 'T', raw: hexToBytes(trimmed) };
  }

  if (/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    // looks like base64 - could be PSBT or transaction
    const bytes = base64ToBytes(decoded);

    if (looksLikePsbt(bytes)) {
      console.debug('Detected type "P" from base64 input');
      return { fileType: 'P', raw: bytes };
    }

    if (bytes[0] === 0x01 || bytes[0] === 0x02) {
      console.debug('Detected type "T" from base64 input');
      return { fileType: 'T', raw: bytes };
    }
  }

  // ensure we have raw bytes for the next step
  raw = raw ?? new TextEncoder().encode(decoded);

  try {
    JSON.parse(decoded);
    console.debug('Detected type "J"');
    return { fileType: 'J', raw };
  } catch (err) {
    // not JSON - fall back to generic Unicode

    console.debug('Detected type "U"');
    return { fileType: 'U', raw };
  }
}
