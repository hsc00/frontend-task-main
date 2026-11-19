export type FileInfo = {
    name: string;
    size: number;
};

export type UploadSuccess = {
    type: 'success';
    status: number;
    message?: string;
};

export type UploadFailure = {
    type: 'failure';
    status: number;
    error: string;
};

export type UploadResult = UploadSuccess | UploadFailure;

export type UploadOptions = {
    /** Chunk size in bytes. If set and file is larger, upload is split into POST /api/upload-chunk chunks. */
    chunkSize?: number;
    /** Max concurrent chunk uploads. Default: 3. */
    concurrency?: number;
    /** Progress callback (loaded bytes, total bytes). */
    onProgress?: (loaded: number, total: number) => void;
};

export interface UploadAdapter {
    upload(file: File, options?: UploadOptions): Promise<UploadResult>;
    uploadBulk?(files: File[], options?: UploadOptions): Promise<UploadResult[]>;
    listFiles(): Promise<FileInfo[]>;
}
