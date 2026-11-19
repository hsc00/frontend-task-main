import { type ReactElement } from 'react';

import { FileList } from './components/FileList/FileList';
import { FileUpload } from './components/FileUpload/FileUpload';
import { useFileList } from './hooks/useFileList';

export const App = (): ReactElement => {
    const { files, api, refreshFiles, removeFile } = useFileList();

    return (
        <main className="relative isolate h-dvh">
            <img
                src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2FjY291bnRzXC82ZVwvNDAwMDM4OFwvcHJvamVjdHNcLzk4NFwvYXNzZXRzXC9iOFwvMTE1MjY1XC8xMjYwMTU0YzFhYmVmMDVjNjZlY2Q2MDdmMTRhZTkxNS0xNjM4MjU4MjQwLmpwZyJ9:weare:_kpZgwnGPTxOhYxIyfS1MhuZmxGrFCzP6ZW6dc-F6BQ?width=2400"
                alt="background image"
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
            />

            <div className="mx-auto max-w-7xl px-6 py-32">
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-800 sm:text-5xl">File Upload</h1>
                <p className="mt-4 text-base text-gray-900 sm:mt-6">Upload new files and view existing ones below.</p>
                <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:gap-12">
                    <FileUpload adapter={api} onUploadSuccess={refreshFiles} />
                    <FileList files={files} onRemove={removeFile} />
                </div>
            </div>
        </main>
    );
};
