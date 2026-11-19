import { type FileInfo, type UploadAdapter, type UploadResult } from './UploadAdapter';

export const API_BASE = '/api';

export class FilesApi implements UploadAdapter {
    async upload(file: File): Promise<UploadResult> {
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

    async listFiles(): Promise<FileInfo[]> {
        const response = await fetch(`${API_BASE}/files`);

        if (!response.ok) {
            throw new Error(`API error ${response.status}`);
        }

        const data = (await response.json()) as { files: FileInfo[] };
        return data.files ?? [];
    }
}

export const filesApi = new FilesApi();
