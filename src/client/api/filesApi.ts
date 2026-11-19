import { type FileInfo, type UploadAdapter, type UploadOptions, type UploadResult } from './UploadAdapter';

const API_BASE = '/api';

export class FilesApi implements UploadAdapter {
    async upload(file: File, _options?: UploadOptions): Promise<UploadResult> {
        // TODO: when chunkSize is set and file.size > options.chunkSize, split into POST /api/upload-chunk chunks
        // with bounded concurrency (options.concurrency ?? 3) and onProgress callback.
        // Server expects FormData fields: file, currentChunkIndex, totalChunks.
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/upload-single`, {
            method: 'POST',
            body: formData,
        });

        const body = (await response.json()) as { message?: string; error?: string };

        if (!response.ok) {
            return {
                type: 'failure',
                status: response.status,
                error: body.error ?? 'Upload failed',
            };
        }

        return {
            type: 'success',
            status: response.status,
            message: body.message,
        };
    }

    uploadBulk?(_files: File[], _options?: UploadOptions): Promise<UploadResult[]> {
        // TODO: optional bulk upload — iterate files, call upload() for each with bounded concurrency.
        // Not implemented yet; single-file upload is the default.
        throw new Error('Not implemented');
    }

    async listFiles(): Promise<FileInfo[]> {
        const response = await fetch(`${API_BASE}/files`);

        if (!response.ok) {
            throw new Error(`API error ${response.status}`);
        }

        const data = (await response.json()) as { files: FileInfo[] };
        return data.files ?? [];
    }
}
