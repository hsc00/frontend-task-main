import { useState, useRef, useId, type ChangeEvent } from 'react';

import { type UploadAdapter, type UploadResult } from '../../api/UploadAdapter';

type FileUploadProps = {
    adapter: UploadAdapter;
    accept?: string;
    disabled?: boolean;
    chunkSize?: number;
    concurrency?: number;
    onProgress?: (loaded: number, total: number) => void;
    onUploadSuccess?: (result: UploadResult) => void;
    onUploadError?: (result: UploadResult) => void;
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const FileUpload = ({
    adapter,
    accept,
    disabled = false,
    chunkSize,
    concurrency,
    onProgress,
    onUploadSuccess,
    onUploadError,
}: FileUploadProps): JSX.Element => {
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

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setErrorMessage(null);

        const file = files[0];

        // Block overlapping upload of same file
        if (isBusy && uploadingFile?.name === file.name && uploadingFile.size === file.size) {
            return;
        }

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
            } else {
                handleUploadError(result);
            }
        } catch {
            handleUploadError({ type: 'failure', status: 0, error: 'Unexpected error' });
        }
    };

    const handleRetry = async () => {
        if (!uploadingFile) {
            return;
        }
        setErrorMessage(null);
        setState('uploading');
        setStatusAnnouncement(`Uploading ${uploadingFile.name}`);

        try {
            const result = await adapter.upload(uploadingFile, {
                chunkSize,
                concurrency,
                onProgress,
            });

            if (result.type === 'success') {
                handleUploadSuccess(result, uploadingFile.name);
            } else {
                handleUploadError(result);
            }
        } catch {
            handleUploadError({ type: 'failure', status: 0, error: 'Unexpected error' });
        }
    };

    const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        await handleFiles(event.target.files);
    };

    const handleClick = () => {
        if (disabled || inputRef.current === null) {
            return;
        }
        inputRef.current.click();
    };

    const isBusy = state === 'uploading';
    const baseClasses = 'flex items-center justify-center gap-2 px-4 py-3 border rounded-md transition-colors';
    const disabledClasses = `${baseClasses} border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed`;
    const busyClasses = `${baseClasses} border-blue-500 bg-blue-50 text-blue-700`;
    const defaultClasses = `${baseClasses} border-gray-300 hover:border-gray-500 text-gray-700 hover:bg-gray-50`;

    let uploadButtonClassName: string;
    if (disabled) {
        uploadButtonClassName = disabledClasses;
    } else if (isBusy) {
        uploadButtonClassName = busyClasses;
    } else {
        uploadButtonClassName = defaultClasses;
    }

    return (
        <div className="space-y-3">
            <button
                type="button"
                disabled={disabled || isBusy}
                aria-label="Upload file"
                aria-busy={isBusy}
                aria-describedby={errorMessage ? errorId : undefined}
                onClick={handleClick}
                className={uploadButtonClassName}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                </svg>
                <span>Upload file</span>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                disabled={disabled}
                hidden
                aria-label="Select file"
                onChange={handleInputChange}
            />

            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {statusAnnouncement}
            </div>

            {state === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Upload complete</span>
                </div>
            )}

            {state === 'error' && errorMessage && (
                <div id={errorId} role="alert" className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{errorMessage}</span>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm underline"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};
