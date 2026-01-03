import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Upload files to the server immediately
 * @param {File[]} files - Array of files to upload
 * @param {string} type - Type of property (VILLA, APPARTEMENT, etc.) or TEMP
 * @returns {Promise<Object[]>} Array of uploaded file metadata with URLs
 */
export const uploadFilesImmediately = async (files, type = 'TEMP') => {
    try {
        const formData = new FormData();
        
        // Add type to FormData first (crucial for Multer to read it before files)
        formData.append('type', type);
        
        // Add all files to FormData
        files.forEach(file => {
            formData.append('files', file);
        });

        const token = localStorage.getItem('authToken');
        
        const response = await axios.post(`${API_URL}/api/upload/temp`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.status === 'success') {
            return response.data.files;
        } else {
            throw new Error(response.data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

/**
 * Delete a temporarily uploaded file
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<void>}
 */
export const deleteTempFile = async (filename) => {
    try {
        const token = localStorage.getItem('authToken');
        
        const response = await axios.delete(`${API_URL}/api/upload/temp/${filename}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};
