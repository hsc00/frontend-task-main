import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

import { type UploadAdapter } from '../../api/UploadAdapter';

import { FileUpload } from './FileUpload';

const mockAdapter = (): UploadAdapter => ({
    upload: vi.fn(),
    listFiles: vi.fn(),
});

const renderComponent = (adapter: UploadAdapter) => render(<FileUpload adapter={adapter} />);

describe('FileUpload', () => {
    let adapter: UploadAdapter;

    beforeEach(() => {
        adapter = mockAdapter();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders upload button and file input', () => {
        renderComponent(adapter);

        expect(screen.getByRole('button', { name: 'Upload file' })).toBeInTheDocument();
        expect(screen.getByLabelText('Select file')).toBeInTheDocument();
    });

    it('calls adapter.upload with the selected file', async () => {
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        (adapter.upload as ReturnType<typeof vi.fn>).mockResolvedValue({
            type: 'success',
            status: 200,
            message: 'ok',
        });

        renderComponent(adapter);
        fireEvent.change(screen.getByLabelText('Select file'), {
            target: { files: [file] as unknown as FileList },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(adapter.upload).toHaveBeenCalledWith(file, expect.anything());
    });

    it('shows success message on successful upload', async () => {
        (adapter.upload as ReturnType<typeof vi.fn>).mockResolvedValue({
            type: 'success',
            status: 200,
            message: 'Uploaded',
        });

        renderComponent(adapter);
        fireEvent.change(screen.getByLabelText('Select file'), {
            target: { files: [new File(['x'], 'x.txt')] as unknown as FileList },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(screen.getByText('Upload complete')).toBeInTheDocument();
    });

    it('shows error message on failed upload', async () => {
        (adapter.upload as ReturnType<typeof vi.fn>).mockResolvedValue({
            type: 'failure',
            status: 400,
            error: 'Missing file',
        });

        renderComponent(adapter);
        fireEvent.change(screen.getByLabelText('Select file'), {
            target: { files: [new File(['x'], 'x.txt')] as unknown as FileList },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(screen.getByRole('alert')).toHaveTextContent('Missing file');
    });

    it('triggers file dialog when button is clicked', () => {
        const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
        renderComponent(adapter);

        fireEvent.click(screen.getByRole('button', { name: 'Upload file' }));

        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });
});
