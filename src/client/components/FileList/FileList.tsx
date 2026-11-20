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
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(file.name)}
                                aria-label={`Remove ${file.name}`}
                                className="text-red-500 hover:text-red-700 text-sm ml-5"
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
