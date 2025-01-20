import { ENCODINGS, FILETYPES } from './consts';
import { Encoding, FileType, JoinResult } from './types';
import { decodeData } from './utils';

export function joinQRs(parts: string[]): JoinResult {
  const headers = new Set(parts.map((p) => p.slice(0, 6)));

  if (headers.size !== 1) {
    throw new Error('conflicting/variable filetype/encodings/sizes');
  }

  const header = [...headers][0];

  if (header.slice(0, 2) !== 'B$') {
    throw new Error('fixed header not found, expected B$');
  }

  if (!ENCODINGS.has(header[2])) {
    throw new Error(`bad encoding: ${header[2]}`);
  }
  if (!FILETYPES.has(header[3])) {
    throw new Error(`bad file type: ${header[3]}`);
  }

  const encoding = header[2] as Encoding;
  const fileType = header[3] as FileType;

  const numParts = parseInt(header.slice(4, 6), 36);

  if (numParts < 1) {
    throw new Error('zero parts?');
  }

  const data = new Map<number, string>();

  for (const p of parts) {
    const idx = parseInt(p.slice(6, 8), 36);

    if (idx >= numParts) {
      throw new Error(`got part ${idx} but only expecting ${numParts}`);
    }

    if (data.has(idx) && data.get(idx) !== p.slice(8)) {
      throw new Error(`Duplicate part 0x${idx.toString(16)} has wrong content`);
    }

    data.set(idx, p.slice(8));
  }

  const orderedParts = [];

  for (let i = 0; i < numParts; i++) {
    const p = data.get(i);

    if (!p) {
      throw new Error(`Part ${i} is missing`);
    }

    orderedParts.push(p);
  }

  const raw = decodeData(orderedParts, encoding);

  return { fileType, encoding, raw };
}
