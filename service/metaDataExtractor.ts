// service/metaDataExtractor.ts
import { IMusicTrack } from "@/types/database";
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

// ─── URI Encoding ─────────────────────────────────────────────────────────────
// '#', spaces, etc. in filenames break FileSystem if not encoded
function encodeFileUri(uri: string): string {
    if (!uri.startsWith('file://')) return uri;
    return 'file://' + uri.slice(7).split('/').map(encodeURIComponent).join('/');
}

// ─── Partial file reader ──────────────────────────────────────────────────────
async function readBytes(uri: string, position: number, length: number): Promise<Buffer> {
    const b64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        position,
        length,
    });
    return Buffer.from(b64, 'base64');
}

// ─── ID3v2 Parser ─────────────────────────────────────────────────────────────
const TEXT_FRAMES = ['TIT2', 'TPE1', 'TALB', 'TPE2', 'TRCK', 'TDRC', 'TYER'];

function parseID3v2(buf: Buffer): Record<string, string | Buffer | null> {
    const result: Record<string, string | Buffer | null> = {};
    if (buf.toString('ascii', 0, 3) !== 'ID3') return result;

    const majorVersion = buf[3];
    const tagSize =
        ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) |
        ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);

    const frameIdLen = majorVersion === 2 ? 3 : 4;
    const frameHeaderLen = majorVersion === 2 ? 6 : 10;
    let offset = 10;
    const end = Math.min(10 + tagSize, buf.length);

    while (offset + frameHeaderLen < end) {
        const frameId = buf.toString('ascii', offset, offset + frameIdLen);
        if (!frameId || frameId[0] === '\0') break;

        let frameSize = 0;
        if (majorVersion === 2) {
            frameSize = (buf[offset + 3] << 16) | (buf[offset + 4] << 8) | buf[offset + 5];
        } else if (majorVersion === 4) {
            frameSize = ((buf[offset + 4] & 0x7f) << 21) | ((buf[offset + 5] & 0x7f) << 14) |
                ((buf[offset + 6] & 0x7f) << 7) | (buf[offset + 7] & 0x7f);
        } else {
            frameSize = (buf[offset + 4] << 24) | (buf[offset + 5] << 16) |
                (buf[offset + 6] << 8) | buf[offset + 7];
        }

        offset += frameHeaderLen;
        if (frameSize <= 0 || offset + frameSize > end) break;

        const frameData = buf.slice(offset, offset + frameSize);
        const normalised = majorVersion === 2
            ? ({
                TT2: 'TIT2', TP1: 'TPE1', TAL: 'TALB', TP2: 'TPE2',
                TRK: 'TRCK', TYE: 'TDRC', PIC: 'APIC'
            }[frameId] ?? frameId)
            : frameId;

        if (TEXT_FRAMES.includes(normalised)) {
            const enc = frameData[0];
            const text = frameData.slice(1);
            result[normalised] = (enc === 1 || enc === 2)
                ? text.toString('utf16le').replace(/\0/g, '').trim()
                : text.toString('utf8').replace(/\0/g, '').trim();
        } else if (normalised === 'APIC') {
            result['APIC'] = frameData;
        }
        offset += frameSize;
    }
    return result;
}

// ─── ID3v1 Fallback ───────────────────────────────────────────────────────────
async function tryID3v1(uri: string): Promise<Record<string, string> | null> {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists || !('size' in info) || (info as any).size < 128) return null;

        const buf = await readBytes(uri, (info as any).size - 128, 128);
        if (buf.toString('ascii', 0, 3) !== 'TAG') return null;

        const readFixed = (start: number, len: number) =>
            buf.toString('latin1', start, start + len).replace(/\0/g, '').trim();

        return {
            title: readFixed(3, 30),
            artist: readFixed(33, 30),
            album: readFixed(63, 30),
            year: readFixed(93, 4),
        };
    } catch {
        return null;
    }
}

// ─── MP4/M4A Atom Parser ──────────────────────────────────────────────────────
// iTunes metadata lives at: moov › udta › meta › ilst
// Each ilst child: ©nam=title, ©ART=artist, ©alb=album, aART=albumArtist,
//                  ©day=year, trkn=track, covr=artwork

const ILST_MAP: Record<string, string> = {
    '©nam': 'title',
    '©ART': 'artist',
    '©alb': 'album',
    'aART': 'albumArtist',
    '©day': 'year',
    'trkn': 'trackNumber',
    'covr': 'artwork',
};

function findAtom(buf: Buffer, name: string, offset = 0, end?: number): number {
    end = end ?? buf.length;
    while (offset + 8 <= end) {
        const size = buf.readUInt32BE(offset);
        const type = buf.toString('ascii', offset + 4, offset + 8);
        if (size < 8) break;
        if (type === name) return offset;
        offset += size;
    }
    return -1;
}

function parseIlst(buf: Buffer, offset: number, end: number): Record<string, string | Buffer> {
    const result: Record<string, string | Buffer> = {};
    while (offset + 8 < end) {
        const atomSize = buf.readUInt32BE(offset);
        if (atomSize < 8 || offset + atomSize > end) break;

        const atomName = buf.toString('utf8', offset + 4, offset + 8);
        const key = ILST_MAP[atomName];

        if (key) {
            // Each ilst child contains a 'data' atom at +8
            const dataOffset = offset + 8;
            if (dataOffset + 16 < offset + atomSize) {
                const dataSize = buf.readUInt32BE(dataOffset);
                // data atom: 4 size + 4 'data' + 4 type flags + 4 locale = 16 bytes header
                const payloadStart = dataOffset + 16;
                const payloadEnd = dataOffset + dataSize;

                if (payloadEnd <= offset + atomSize) {
                    if (atomName === 'covr') {
                        result[key] = buf.slice(payloadStart, payloadEnd);
                    } else if (atomName === 'trkn') {
                        // 2 bytes padding + 2 bytes track number
                        if (payloadEnd - payloadStart >= 4) {
                            result[key] = String(buf.readUInt16BE(payloadStart + 2));
                        }
                    } else {
                        result[key] = buf.toString('utf8', payloadStart, payloadEnd).replace(/\0/g, '').trim();
                    }
                }
            }
        }
        offset += atomSize;
    }
    return result;
}

async function extractM4ATags(uri: string): Promise<Record<string, string | Buffer> | null> {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists) return null;
        const fileSize = (info as any).size as number;

        // Read first 512 KB — enough for moov in most streaming-optimised files
        const chunkSize = Math.min(512 * 1024, fileSize);
        let buf = await readBytes(uri, 0, chunkSize);

        let moovOffset = findAtom(buf, 'moov');

        // If moov isn't in the first chunk, check the last 512 KB
        if (moovOffset === -1 && fileSize > chunkSize) {
            const tailStart = Math.max(0, fileSize - chunkSize);
            buf = await readBytes(uri, tailStart, fileSize - tailStart);
            moovOffset = findAtom(buf, 'moov');
        }
        if (moovOffset === -1) return null;

        const moovSize = buf.readUInt32BE(moovOffset);
        const moovEnd = moovOffset + moovSize;
        const udtaOffset = findAtom(buf, 'udta', moovOffset + 8, moovEnd);
        if (udtaOffset === -1) return null;

        const udtaSize = buf.readUInt32BE(udtaOffset);
        const udtaEnd = udtaOffset + udtaSize;
        const metaOffset = findAtom(buf, 'meta', udtaOffset + 8, udtaEnd);
        if (metaOffset === -1) return null;

        const metaSize = buf.readUInt32BE(metaOffset);
        const metaEnd = metaOffset + metaSize;
        // 'meta' has an extra 4-byte version/flags field before children
        const ilstOffset = findAtom(buf, 'ilst', metaOffset + 12, metaEnd);
        if (ilstOffset === -1) return null;

        const ilstSize = buf.readUInt32BE(ilstOffset);
        return parseIlst(buf, ilstOffset + 8, ilstOffset + ilstSize);
    } catch {
        return null;
    }
}

// ─── Artwork helper ───────────────────────────────────────────────────────────
function extractID3Artwork(apicFrame: Buffer): string | null {
    try {
        const enc = apicFrame[0];
        let i = 1;
        while (i < apicFrame.length && apicFrame[i] !== 0) i++;
        const mimeType = apicFrame.slice(1, i).toString('ascii') || 'image/jpeg';
        i++; i++; // skip null + picture-type byte
        if (enc === 1 || enc === 2) {
            while (i + 1 < apicFrame.length && !(apicFrame[i] === 0 && apicFrame[i + 1] === 0)) i += 2;
            i += 2;
        } else {
            while (i < apicFrame.length && apicFrame[i] !== 0) i++;
            i++;
        }
        return `data:${mimeType};base64,${apicFrame.slice(i).toString('base64')}`;
    } catch { return null; }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const extractAudioMetadata = async (
    fileUri: string
): Promise<Partial<IMusicTrack> | null> => {
    const uri = encodeFileUri(fileUri);
    const isM4A = /\.m4a$/i.test(uri);

    try {
        // ── M4A: use MP4 atom parser ──────────────────────────────────────────
        if (isM4A) {
            const tags = await extractM4ATags(uri);
            if (!tags) return null;

            let artwork: string | null = null;
            if (tags.artwork instanceof Buffer) {
                artwork = `data:image/jpeg;base64,${tags.artwork.toString('base64')}`;
            }

            return {
                title: (tags.title as string) || null,
                artist: (tags.artist as string) || 'Unknown Artist',
                album: (tags.album as string) || 'Unknown Album',
                albumArtist: (tags.albumArtist as string) || null,
                trackNumber: parseInt(tags.trackNumber as string, 10) || 0,
                year: parseInt((tags.year as string)?.substring(0, 4), 10) || null,
                artwork,
            };
        }

        // ── MP3: try ID3v2 first ──────────────────────────────────────────────
        const header = await readBytes(uri, 0, 10);

        if (header.toString('ascii', 0, 3) === 'ID3') {
            const tagSize =
                ((header[6] & 0x7f) << 21) | ((header[7] & 0x7f) << 14) |
                ((header[8] & 0x7f) << 7) | (header[9] & 0x7f);

            const buf = await readBytes(uri, 0, 10 + tagSize);
            const tags = parseID3v2(buf);

            let artwork: string | null = null;
            if (tags['APIC']) artwork = extractID3Artwork(tags['APIC'] as Buffer);

            return {
                title: (tags['TIT2'] as string) || null,
                artist: (tags['TPE1'] as string) || 'Unknown Artist',
                album: (tags['TALB'] as string) || 'Unknown Album',
                albumArtist: (tags['TPE2'] as string) || null,
                trackNumber: parseInt(((tags['TRCK'] as string) ?? '').split('/')[0], 10) || 0,
                year: parseInt(((tags['TDRC'] as string) ?? '').substring(0, 4), 10) || null,
                artwork,
            };
        }

        // ── MP3: fall back to ID3v1 (last 128 bytes) ──────────────────────────
        const v1 = await tryID3v1(uri);
        if (v1) {
            return {
                title: v1.title || null,
                artist: v1.artist || 'Unknown Artist',
                album: v1.album || 'Unknown Album',
                albumArtist: null,
                trackNumber: 0,
                year: parseInt(v1.year, 10) || null,
                artwork: null,
            };
        }

        return null; // No tags found in this file
    } catch (err) {
        console.warn(`extractAudioMetadata failed for: ${fileUri}`, err);
        return null;
    }
};