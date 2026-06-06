import { Directory, File, Paths } from 'expo-file-system';

type MediaType = 'image' | 'video';

const FOLDERS: Record<MediaType, string> = {
    image: 'albumart',
    video: 'videos',
};

/**
 * Saves a picked media file to permanent document storage.
 * If a file already exists for the given `id`, it is deleted first.
 *
 * @param cacheUri  - The temporary URI from ImagePicker
 * @param type      - 'image' or 'video'
 * @param musicId        - Unique ID for the media item (e.g. musicId, videoId)
 * @returns         - Permanent URI string
 */
export async function saveMedia(
    cacheUri: string,
    type: MediaType,
    musicId: string
): Promise<string> {
    const ext = cacheUri.split('.').pop();
    const folder = FOLDERS[type];

    const dir = new Directory(Paths.document, folder);
    const destFile = new File(dir, `${musicId}.${ext}`);

    if (!dir.exists) {
        dir.create();
    }

    if (destFile.exists) {
        destFile.delete();
    }

    const sourceFile = new File(cacheUri);
    sourceFile.copy(destFile);

    return destFile.uri;
}

export async function saveLyrics(
    sourceUri: string,
    musicId: string
): Promise<string> {
    const dir = new Directory(Paths.document, "lyrics");

    if (!dir.exists) {
        dir.create();
    }

    const destFile = new File(dir, `${musicId}.lrc`);

    if (destFile.exists) {
        destFile.delete();
    }

    const sourceFile = new File(sourceUri);
    sourceFile.copy(destFile);

    return destFile.uri;
}