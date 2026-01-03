// Temporary file upload API
// Uploads files immediately when selected, returns URLs
// Files are stored temporarily until property is created

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Upload files immediately (before property creation)
 * Returns URLs that can be stored in wizard state
 * @param {Array<File>} files - Files to upload
 * @param {string} type - Property type (VILLA, APPARTEMENT, etc.)
 * @returns {Promise<Array<{url: string, filename: string}>>}
 */
export const uploadFilesTemporarily = async (files, type = 'TEMP') => {
    if (!files || files.length === 0) {
        return [];
    }

    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    
    // Append property type for folder organization
    formData.append('type', type);
    
    // Append all files
    files.forEach(file => {
        formData.append('files', file);
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/temp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        return data.files; // Array of {url, filename, originalname}
    } catch (error) {
        console.error('Temporary upload error:', error);
        throw error;
    }
};

/**
 * Delete a temporarily uploaded file
 * @param {string} filename - Filename to delete
 */
export const deleteTempFile = async (filename) => {
    const token = localStorage.getItem('authToken');
    
    try {
        await fetch(`${API_BASE_URL}/api/upload/temp/${filename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Delete temp file error:', error);
    }
};
