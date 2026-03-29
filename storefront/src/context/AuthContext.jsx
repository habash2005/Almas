import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

function loadUser() {
  try {
    const stored = localStorage.getItem('almas_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('almas_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('almas_user');
    }
  }, [user]);

  const login = useCallback((email, password) => {
    // Mock auth: accept any email/password combo
    const userData = {
      id: Date.now(),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    setUser(userData);
    return true;
  }, []);

  const register = useCallback(({ firstName, lastName, email, password }) => {
    const userData = {
      id: Date.now(),
      name: `${firstName} ${lastName}`,
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(userData);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
