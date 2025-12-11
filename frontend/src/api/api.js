
// API Utility Module
// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Helper Functions
/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};
/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token to store
 */
const setAuthToken = (token) => {
    localStorage.setItem('authToken', token);
};
/**
 * Remove authentication token from localStorage
 */
const removeAuthToken = () => {
    localStorage.removeItem('authToken');
};

/**
 * Create headers for API requests
 * @param {boolean} includeAuth - Whether to include authorization header
 * @returns {Object} Headers object
 */
const createHeaders = (includeAuth = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

/**
 * Generic API request handler with error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {Error} API error with message
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        const data = await response.json();

        // Handle non-2xx responses
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please try again.');
        }

        // Handle fetch errors
        if (error instanceof TypeError) {
            throw new Error('Network error. Please check your connection.');
        }

        // Re-throw API errors
        throw error;
    }
};
// Authentication API
/**
 * Sign up a new admin user (one-time only)
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response with user data and token
 */
export const signup = async ({ email, password, nom, prenom, role }) => {
    const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ email, password, nom, prenom, role }),
    });

    // Store token if signup is successful
    if (data.status === 'success' && data.data?.token) {
        setAuthToken(data.data.token);
    }

    return data;
};

/**
 * Login an existing user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response with user data and token
 */
export const login = async ({ email, password }) => {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ email, password }),
    });

    // Store token if login is successful
    if (data.status === 'success' && data.data?.token) {
        setAuthToken(data.data.token);
    }

    return data;
};

/**
 * Logout the current user
 * @returns {Promise<Object>} Response confirming logout
 */
export const logout = async () => {
    try {
        const data = await apiRequest('/api/auth/logout', {
            method: 'POST',
            headers: createHeaders(true),
        });

        // Remove token from storage
        removeAuthToken();

        return data;
    } catch (error) {
        // Remove token even if API call fails
        removeAuthToken();
        throw error;
    }
};

/**
 * Verify the current authentication token
 * @returns {Promise<Object>} Response with user data if token is valid
 */
export const verifyToken = async () => {
    const data = await apiRequest('/api/auth/verify', {
        method: 'GET',
        headers: createHeaders(true),
    });

    return data;
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has a token stored
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

// ============================================================================
// User Management (for future use)
// ============================================================================

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
    const data = await apiRequest('/api/auth/verify', {
        method: 'GET',
        headers: createHeaders(true),
    });

    return data.data?.user || null;
};

// ============================================================================
// Property Management API
// ============================================================================

/**
 * Create a new property
 * Note: Files are uploaded to the server using Multer middleware
 * The backend will process files and store them in the local filesystem
 * @param {Object} propertyData - Property information
 * @param {Array<File>} documents - Array of document files to upload
 * @param {Array<File>} photos - Array of photo files to upload
 * @returns {Promise<Object>} Response with created property data
 */
export const createProperty = async (propertyData, documents = [], photos = []) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/api/properties`;

    const formData = new FormData();
    // Append data first so backend can parse it for folder naming
    formData.append('data', JSON.stringify(propertyData));

    // Append files
    if (documents && documents.length > 0) {
        documents.forEach(file => formData.append('documents', file));
    }
    
    if (photos && photos.length > 0) {
        photos.forEach(file => formData.append('photos', file));
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT * 6); // 60 seconds for uploads

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Content-Type is automatically set by browser with boundary for FormData
            },
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please try again.');
        }
        if (error instanceof TypeError) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

/**
 * Get all properties
 * @returns {Promise<Object>} Response with properties list
 */
export const getAllProperties = async () => {
    const data = await apiRequest('/api/properties', {
        method: 'GET',
        headers: createHeaders(true),
    });

    return data;
};

/**
 * Get a single property by ID
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Response with property data
 */
export const getPropertyById = async (propertyId) => {
    const data = await apiRequest(`/api/properties/${propertyId}`, {
        method: 'GET',
        headers: createHeaders(true),
    });

    return data;
};

/**
 * Delete a property by ID
 * @param {string|number} propertyId - Property ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteProperty = async (propertyId) => {
    const data = await apiRequest(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: createHeaders(true),
    });

    return data;
};

/**
 * Update a property by ID
 * @param {string|number} propertyId - Property ID
 * @param {Object} propertyData - Property information
 * @param {Array<File>} documents - Array of document files to upload
 * @param {Array<File>} photos - Array of photo files to upload
 * @returns {Promise<Object>} Response with updated property data
 */
export const updateProperty = async (propertyId, propertyData, documents = [], photos = []) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/api/properties/${propertyId}`;

    const formData = new FormData();
    formData.append('data', JSON.stringify(propertyData));

    // Append files
    if (documents && documents.length > 0) {
        documents.forEach(file => formData.append('documents', file));
    }
    
    if (photos && photos.length > 0) {
        photos.forEach(file => formData.append('photos', file));
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT * 6); // 60 seconds for uploads

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please try again.');
        }
        if (error instanceof TypeError) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

// ============================================================================
// Export Token Management Functions (for advanced use cases)
// ============================================================================

export const tokenManager = {
    get: getAuthToken,
    set: setAuthToken,
    remove: removeAuthToken,
};

// ============================================================================
// Export API Configuration (for testing/debugging)
// ============================================================================

// ============================================================================
// User Profile API
// ============================================================================

/**
 * Get current user profile
 * @returns {Promise<Object>} Response with user profile data
 */
export const getUserProfile = async () => {
    const data = await apiRequest('/api/user/profile', {
        method: 'GET',
        headers: createHeaders(true),
    });
    return data;
};

/**
 * Update user profile
 * @param {Object} profileData - User profile data (nom, prenom, email)
 * @param {File} photoFile - Profile picture file
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateUserProfile = async (profileData, photoFile) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/api/user/profile`;
    
    const formData = new FormData();
    // Append fields individually
    if (profileData.nom !== undefined) formData.append('nom', profileData.nom);
    if (profileData.prenom !== undefined) formData.append('prenom', profileData.prenom);
    if (profileData.email !== undefined) formData.append('email', profileData.email);
    
    if (photoFile) {
        formData.append('photoProfil', photoFile);
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error updating profile');
    }
    return data;
};

/**
 * Update user password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response confirming update
 */
export const updateUserPassword = async (oldPassword, newPassword) => {
    const data = await apiRequest('/api/user/password', {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify({ oldPassword, newPassword }),
    });
    return data;
};

export const apiConfig = {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
};

// --- Collaborateur Management (Admin Only) ---

/**
 * Get all collaborateurs
 * @returns {Promise<Array>} List of collaborateurs
 */
export const getAllCollaborateurs = async () => {
    const data = await apiRequest('/api/admin/collaborateurs', {
        method: 'GET',
        headers: createHeaders(true),
    });
    return data;
};

/**
 * Get properties created by a specific collaborateur
 * @param {number} id - Collaborateur ID
 * @returns {Promise<Array>} List of properties
 */
export const getCollaborateurProperties = async (id) => {
    const data = await apiRequest(`/api/admin/collaborateurs/${id}/properties`, {
        method: 'GET',
        headers: createHeaders(true),
    });
    return data;
};

/**
 * Create a new collaborateur
 * @param {Object} collaborateurData - { email, password, nom, prenom }
 * @returns {Promise<Object>} Created collaborateur
 */
export const createCollaborateur = async (collaborateurData) => {
    const data = await apiRequest('/api/admin/collaborateurs', {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(collaborateurData),
    });
    return data;
};

/**
 * Delete a collaborateur
 * @param {number} id - Collaborateur ID
 * @returns {Promise<Object>} Success message
 */
export const deleteCollaborateur = async (id) => {
    const data = await apiRequest(`/api/admin/collaborateurs/${id}`, {
        method: 'DELETE',
        headers: createHeaders(true),
    });
    return data;
};

/**
 * Get a single collaborateur by ID
 * @param {number} id - Collaborateur ID
 * @returns {Promise<Object>} Collaborateur data
 */
export const getCollaborateur = async (id) => {
    const data = await apiRequest(`/api/admin/collaborateurs/${id}`, {
        method: 'GET',
        headers: createHeaders(true),
    });
    return data;
};

/**
 * Update a collaborateur
 * @param {number} id - Collaborateur ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated collaborateur
 */
export const updateCollaborateur = async (id, updateData) => {
    const data = await apiRequest(`/api/admin/collaborateurs/${id}`, {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(updateData),
    });
    return data;
};
