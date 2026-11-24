import { useState, useRef, useId } from 'react';

import { type UploadAdapter, type UploadResult } from '../api/UploadAdapter';

type UseFileUploadOptions = {
    adapter: UploadAdapter;
    chunkSize?: number;
    concurrency?: number;
    onProgress?: (loaded: number, total: number) => void;
    onUploadSuccess?: (result: UploadResult) => void;
    onUploadError?: (result: UploadResult) => void;
    maxRetries?: number;
    retryDelay?: number;
};

type UseFileUploadReturn = {
    state: 'idle' | 'uploading' | 'success' | 'error';
    isUploading: boolean;
    errorMessage: string | null;
    statusAnnouncement: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
    errorId: string;
    uploadFiles: (files: FileList | null) => Promise<void>;
    retryUpload: () => Promise<void>;
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const useFileUpload = ({
    adapter,
    chunkSize,
    concurrency,
    onProgress,
    onUploadSuccess,
    onUploadError,
    maxRetries = 3,
    retryDelay = 1000,
}: UseFileUploadOptions): UseFileUploadReturn => {
    const [state, setState] = useState<UploadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [statusAnnouncement, setStatusAnnouncement] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const errorId = useId();

    const handleUploadSuccess = (result: UploadResult, fileName?: string) => {
        setState('success');
        setErrorMessage(null);
        setUploadingFile(null);
        setStatusAnnouncement(`Upload complete: ${fileName ?? uploadingFile?.name}`);
        onUploadSuccess?.(result);
    };

    const handleUploadError = (result: UploadResult) => {
        setState('error');
        const errorText = result.type === 'failure' ? result.error : 'Upload failed';
        setErrorMessage(errorText);
        setStatusAnnouncement(`Upload failed: ${errorText}`);
        onUploadError?.(result);
    };

    const retryWithBackoff = async (file: File, attempt: number) => {
        const nextAttempt = attempt + 1;
        const delay = retryDelay * 2 ** (nextAttempt - 1);
        setStatusAnnouncement(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        await handleUpload(file, nextAttempt);
    };

    const handleUpload = async (file: File, attempt = 0) => {
        setErrorMessage(null);
        setUploadingFile(file);
        setState('uploading');
        setStatusAnnouncement(`Uploading ${file.name}`);

        try {
            const result = await adapter.upload(file, {
                chunkSize,
                concurrency,
                onProgress,
            });

            if (result.type === 'success') {
                handleUploadSuccess(result, file.name);
            } else if (result.status !== 400 && attempt < maxRetries) {
                await retryWithBackoff(file, attempt);
            } else {
                handleUploadError(result);
            }
        } catch {
            if (attempt < maxRetries) {
                await retryWithBackoff(file, attempt);
            } else {
                handleUploadError({ type: 'failure', status: 0, error: 'Unexpected error' });
            }
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        if (state === 'uploading' && uploadingFile?.name === file.name && uploadingFile.size === file.size) {
            return;
        }

        await handleUpload(file);
    };

    const handleRetry = async () => {
        if (!uploadingFile) {
            return;
        }
        await handleUpload(uploadingFile);
    };

    return {
        state,
        isUploading: state === 'uploading',
        errorMessage,
        statusAnnouncement,
        inputRef,
        errorId,
        uploadFiles: handleFiles,
        retryUpload: handleRetry,
    };
};
