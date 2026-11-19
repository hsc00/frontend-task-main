import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';
import { App } from './App';

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
    cleanup();
    mockFetch.mockReset();
});

describe('App', () => {
    it('should render the upload component and file list', () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ files: [] }),
        } as Response);

        render(<App />);

        expect(screen.getByText('File Upload')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upload file' })).toBeInTheDocument();
        expect(screen.getByText('No files uploaded yet.')).toBeInTheDocument();
    });

    it('uploads a file and shows it in the file list', async () => {
        let uploadPosted = false;

        mockFetch.mockImplementation((url: string) => {
            if (url.toString().includes('/api/upload-single')) {
                uploadPosted = true;
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'File uploaded successfully' }),
                } as Response);
            }
            // Only return files after a successful upload
            if (!uploadPosted) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ files: [] }),
                } as Response);
            }
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ files: [{ name: 'hello.txt', size: 5 }] }),
            } as Response);
        });

        render(<App />);

        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        fireEvent.change(screen.getAllByLabelText('Select file')[0], {
            target: { files: [file] as unknown as FileList },
        });

        await waitFor(() => {
            expect(screen.getByText('hello.txt')).toBeInTheDocument();
        });

        // Assert POST happened before the list refresh
        expect(uploadPosted).toBe(true);
    });
});
