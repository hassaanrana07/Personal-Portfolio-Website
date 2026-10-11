import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'hassaan_admin_token';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * useAdminAuth Hook
 * 
 * Provides centralized administrative authentication state management:
 * - JWT token persistence in localStorage and httpOnly cookie
 * - Session restoration on page load via GET /api/auth/me
 * - Login (POST /api/auth/login) with error handling
 * - Logout (POST /api/auth/logout) and state cleanup
 */
export function useAdminAuth() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify session with server on initial load or token change
  const verifySession = useCallback(async (tokenToVerify) => {
    setLoading(true);
    setError(null);

    try {
      const activeToken = tokenToVerify !== undefined ? tokenToVerify : token;
      const headers = { Accept: 'application/json' };

      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Session invalid or expired');
      }

      const json = await res.json();
      if (json && json.success && json.admin) {
        setAdmin(json.admin);
        if (activeToken) {
          setToken(activeToken);
          try {
            localStorage.setItem(TOKEN_KEY, activeToken);
          } catch {}
        }
        return json.admin;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (err) {
      setAdmin(null);
      setToken(null);
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {}
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial session check on mount
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Login handler
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.message || 'Authentication failed. Please check your credentials.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const newToken = json.token || null;
      const adminData = json.admin || null;

      if (newToken) {
        setToken(newToken);
        try {
          localStorage.setItem(TOKEN_KEY, newToken);
        } catch {}
      }

      setAdmin(adminData);
      return { success: true, admin: adminData, token: newToken };
    } catch (err) {
      setError(err.message || 'Login request failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // One-Time First Admin Setup handler
  const setupAdmin = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name ? name.trim() : 'Hassaan Ali Akbar',
          email: email.trim(),
          password
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.message || 'Administrator setup failed.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const newToken = json.token || null;
      const adminData = json.admin || null;

      if (newToken) {
        setToken(newToken);
        try {
          localStorage.setItem(TOKEN_KEY, newToken);
        } catch {}
      }

      setAdmin(adminData);
      return { success: true, admin: adminData, token: newToken };
    } catch (err) {
      setError(err.message || 'Administrator setup failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Account Credentials handler
  const updateAccount = useCallback(async (currentPassword, newEmail, newPassword, newName) => {
    setLoading(true);
    setError(null);

    try {
      const activeToken = token;
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }

      const res = await fetch(`${API_BASE}/api/auth/update-account`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail ? newEmail.trim() : undefined,
          newPassword: newPassword || undefined,
          newName: newName ? newName.trim() : undefined
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.message || 'Failed to update credentials.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const newToken = json.token || null;
      const adminData = json.admin || null;

      if (newToken) {
        setToken(newToken);
        try {
          localStorage.setItem(TOKEN_KEY, newToken);
        } catch {}
      }

      if (adminData) {
        setAdmin(adminData);
      }

      return { success: true, admin: adminData, token: newToken };
    } catch (err) {
      setError(err.message || 'Failed to update credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Logout handler
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {}

    setAdmin(null);
    setToken(null);
    setError(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setLoading(false);
  }, []);

  return {
    admin,
    token,
    isAuthenticated: Boolean(admin),
    loading,
    error,
    login,
    setupAdmin,
    updateAccount,
    logout,
    verifySession
  };
}

export default useAdminAuth;
