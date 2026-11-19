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

export interface UploadAdapter {
    upload(file: File): Promise<UploadResult>;
    listFiles(): Promise<FileInfo[]>;
}
