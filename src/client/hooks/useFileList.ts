import { useEffect, useState } from 'react';

import { type FileInfo } from '../api/UploadAdapter';
import { FilesApi } from '../api/filesApi';

const api = new FilesApi();

export const useFileList = () => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    const refreshFiles = async () => {
        try {
            setFiles(await api.listFiles());
        } catch (error) {
            console.error('Failed to list files:', error);
        }
    };

    useEffect(() => {
        refreshFiles().catch((error) => {
            console.error('Failed to list files:', error);
        });
    }, []);

    const removeFile = (name: string) => {
        // Provided API has no delete endpoint; remove optimistically from local state
        setFiles((prev) => prev.filter((file) => file.name !== name));
    };

    return { files, api, refreshFiles, removeFile };
};
