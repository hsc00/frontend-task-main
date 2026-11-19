import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

import { type FileInfo } from '../../api/UploadAdapter';

import { FileList } from './FileList';

describe('FileList', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders empty state when no files', () => {
        render(<FileList files={[]} onRemove={vi.fn()} />);

        expect(screen.getByText('No files uploaded yet.')).toBeInTheDocument();
    });

    it('renders files with name and size', () => {
        const files: FileInfo[] = [
            { name: 'a.txt', size: 1024 },
            { name: 'b.jpg', size: 2048 },
        ];
        const onRemove = vi.fn();
        render(<FileList files={files} onRemove={onRemove} />);

        expect(screen.getByText('a.txt')).toBeInTheDocument();
        expect(screen.getByText('b.jpg')).toBeInTheDocument();
    });

    it('calls onRemove when remove button is clicked', () => {
        const onRemove = vi.fn();
        render(<FileList files={[{ name: 'a.txt', size: 1024 }]} onRemove={onRemove} />);

        fireEvent.click(screen.getByRole('button', { name: 'Remove a.txt' }));

        expect(onRemove).toHaveBeenCalledWith('a.txt');
    });
});
