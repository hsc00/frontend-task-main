import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

import { FilesApi } from './filesApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockResponse = (ok: boolean, status: number, body: unknown) => {
    mockFetch.mockResolvedValue({
        ok,
        status,
        json: () => Promise.resolve(body),
    } as Response);
};

describe('FilesApi', () => {
    let api: FilesApi;

    beforeEach(() => {
        vi.clearAllMocks();
        api = new FilesApi();
    });

    afterEach(() => {
        mockFetch.mockReset();
    });

    it('upload returns success on 200', async () => {
        mockResponse(true, 200, { message: 'File uploaded successfully' });

        const result = await api.upload(new File(['x'], 'x.txt'));

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result.type).toBe('success');
        expect(result.status).toBe(200);
        if (result.type === 'success') {
            expect(result.message).toBe('File uploaded successfully');
        }
    });

    it('upload returns failure on 400', async () => {
        mockResponse(false, 400, { error: 'Missing file' });

        const result = await api.upload(new File(['x'], 'x.txt'));

        expect(result.type).toBe('failure');
        expect(result.status).toBe(400);
        if (result.type === 'failure') {
            expect(result.error).toBe('Missing file');
        }
    });

    it('listFiles returns files on 200', async () => {
        mockResponse(true, 200, { files: [{ name: 'a.txt', size: 1024 }] });

        const files = await api.listFiles();

        expect(files).toEqual([{ name: 'a.txt', size: 1024 }]);
    });

    it('listFiles throws on non-ok', async () => {
        mockResponse(false, 500, { message: 'Server error' });

        await expect(api.listFiles()).rejects.toThrow('API error 500');
    });
});
