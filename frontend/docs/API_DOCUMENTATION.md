# API Utility Module Documentation

## Overview

The `api.js` module provides a clean, centralized interface for all backend API interactions in the ElMordjane Real Estate Dashboard. It follows clean architecture principles with proper separation of concerns, error handling, and token management.

## Features

✅ **Clean Architecture**: Centralized API calls with consistent error handling  
✅ **Token Management**: Automatic JWT token storage and retrieval  
✅ **Error Handling**: Comprehensive error handling with user-friendly messages  
✅ **Timeout Protection**: Automatic request timeout after 10 seconds  
✅ **Type Safety**: Well-documented functions with JSDoc comments  

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

If not set, the API will default to `http://localhost:3000`.

## API Functions

### Authentication

#### `signup({ email, password })`

Creates a new admin account (one-time only).

**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:**
```javascript
{
  status: 'success',
  message: 'Admin account created successfully',
  data: {
    user: {
      id: string,
      email: string,
      role: string,
      dateCreation: Date
    },
    token: string
  }
}
```

**Example:**
```javascript
import { signup } from '../utils/api';

try {
  const response = await signup({ 
    email: 'admin@elmordjane.com', 
    password: 'securePassword123' 
  });
  console.log('Signup successful:', response.data.user);
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

---

#### `login({ email, password })`

Authenticates an existing user.

**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:**
```javascript
{
  status: 'success',
  message: 'Login successful',
  data: {
    user: {
      id: string,
      email: string,
      role: string,
      dateCreation: Date
    },
    token: string
  }
}
```

**Example:**
```javascript
import { login } from '../utils/api';

try {
  const response = await login({ 
    email: 'admin@elmordjane.com', 
    password: 'securePassword123' 
  });
  console.log('Login successful:', response.data.user);
  // Token is automatically stored in localStorage
} catch (error) {
  console.error('Login failed:', error.message);
}
```

---

#### `logout()`

Logs out the current user and removes the authentication token.

**Returns:**
```javascript
{
  status: 'success',
  message: 'Logout successful. Please remove the token from client storage.'
}
```

**Example:**
```javascript
import { logout } from '../utils/api';

try {
  await logout();
  console.log('Logged out successfully');
  // Token is automatically removed from localStorage
} catch (error) {
  console.error('Logout failed:', error.message);
  // Token is still removed even if API call fails
}
```

---

#### `verifyToken()`

Verifies the current authentication token.

**Returns:**
```javascript
{
  status: 'success',
  message: 'Token is valid',
  data: {
    user: {
      id: string,
      email: string,
      role: string
    }
  }
}
```

**Example:**
```javascript
import { verifyToken } from '../utils/api';

try {
  const response = await verifyToken();
  console.log('Token is valid:', response.data.user);
} catch (error) {
  console.error('Token is invalid:', error.message);
  // Redirect to login page
}
```

---

#### `isAuthenticated()`

Checks if a user is currently authenticated (has a token stored).

**Returns:** `boolean`

**Example:**
```javascript
import { isAuthenticated } from '../utils/api';

if (isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in');
}
```

---

#### `getCurrentUser()`

Gets the current user's profile data.

**Returns:**
```javascript
{
  id: string,
  email: string,
  role: string
}
```

**Example:**
```javascript
import { getCurrentUser } from '../utils/api';

try {
  const user = await getCurrentUser();
  console.log('Current user:', user);
} catch (error) {
  console.error('Failed to get user:', error.message);
}
```

## Token Management

### Direct Token Access

For advanced use cases, you can directly access token management functions:

```javascript
import { tokenManager } from '../utils/api';

// Get token
const token = tokenManager.get();

// Set token
tokenManager.set('your-jwt-token');

// Remove token
tokenManager.remove();
```

## Error Handling

All API functions throw errors with user-friendly messages. Always wrap API calls in try-catch blocks:

```javascript
try {
  const response = await login({ email, password });
  // Handle success
} catch (error) {
  // error.message contains a user-friendly error message
  console.error(error.message);
}
```

### Common Error Messages

- `"Email and password are required"` - Missing credentials
- `"Invalid email or password"` - Authentication failed
- `"Admin account already exists. Signup is disabled."` - Signup attempted when admin exists
- `"Request timeout. Please try again."` - Request took longer than 10 seconds
- `"Network error. Please check your connection."` - Network connectivity issue

## Usage in React Components

### Login Component Example

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.status === 'success') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Protected Route Example

```javascript
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyToken } from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyToken();
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    };
    checkAuth();
  }, []);

  if (isValid === null) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/login" />;
  return children;
};
```

## Architecture Benefits

1. **Single Source of Truth**: All API endpoints are defined in one place
2. **Consistent Error Handling**: Unified error handling across the application
3. **Easy Testing**: Mock the API module for unit tests
4. **Maintainability**: Easy to update API endpoints or add new ones
5. **Type Safety**: JSDoc comments provide IDE autocomplete and type checking
6. **Security**: Automatic token management with secure storage

## Future Enhancements

Potential additions to the API module:

- [ ] Refresh token functionality
- [ ] Request retry logic
- [ ] Request caching
- [ ] Request cancellation
- [ ] API response interceptors
- [ ] Request logging/analytics
- [ ] Multi-language error messages

## Backend Integration

This module is designed to work with the ElMordjane backend API:

- **Base URL**: `http://localhost:3000`
- **Auth Routes**: `/api/auth/*`
- **Authentication**: JWT Bearer tokens
- **Response Format**: JSON with `{ status, message, data }` structure

## Support

For issues or questions about the API module, please refer to the main project documentation or contact the development team.
