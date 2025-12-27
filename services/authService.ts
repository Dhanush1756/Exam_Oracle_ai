
import { User } from '../types';

const STORAGE_KEY = 'oracle_users';
const SESSION_KEY = 'oracle_current_session';

export const authService = {
  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('An account with this scroll (email) already exists.');
    }

    if (password.length < 6) {
      throw new Error('The password must be at least 6 characters long for protection.');
    }

    const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, name };
    const authData = { ...newUser, password: btoa(password) }; // Basic mock hashing
    
    users.push(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === btoa(password));
    
    if (!user) {
      throw new Error('Invalid credentials. The stars do not align for this login.');
    }

    const { password: _, ...userData } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
