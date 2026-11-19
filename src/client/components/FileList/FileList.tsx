import { type FileInfo } from '../../api/UploadAdapter';

type FileListProps = {
    files: FileInfo[];
    onRemove: (name: string) => void;
};

export const FileList = ({ files, onRemove }: FileListProps): JSX.Element => {
    const handleRemove = (name: string) => {
        onRemove(name);
    };

    return (
        <div>
            {files.length === 0 ? (
                <p className="text-gray-500 text-sm">No files uploaded yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                        <li key={file.name} className="flex justify-between items-center py-3">
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 20l4-16m2 16l4-16m6 16l4-16m2 16l4-16m6 16l4-16m2 16l4-16m6 16l4-16m2 16l4-16"
                                    />
                                </svg>
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(file.name)}
                                aria-label={`Remove ${file.name}`}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
