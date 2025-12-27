
import { User, QuizAttempt } from '../types';

const STORAGE_KEY = 'oracle_users';
const SESSION_KEY = 'oracle_current_session';
const SCORES_KEY = 'oracle_global_scores'; // Global scores for ranking

export const authService = {
  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) throw new Error('Account already exists.');
    
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      email, 
      name,
      friends: [] 
    };
    const authData = { ...newUser, password: btoa(password) }; 
    users.push(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === btoa(password));
    if (!user) throw new Error('Invalid credentials.');

    const { password: _, ...userData } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: () => localStorage.removeItem(SESSION_KEY),

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  getAllUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return users.map(({ password, ...u }: any) => u);
  },

  addFriend: (friendId: string) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser.id) {
        const friends = u.friends || [];
        if (!friends.includes(friendId)) friends.push(friendId);
        return { ...u, friends };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    const updatedSelf = updatedUsers.find((u: any) => u.id === currentUser.id);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSelf));
  },

  getFriends: (): User[] => {
    const user = authService.getCurrentUser();
    if (!user || !user.friends) return [];
    const allUsers = authService.getAllUsers();
    return allUsers.filter(u => user.friends?.includes(u.id));
  },

  saveQuizAttempt: (attemptData: Omit<QuizAttempt, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const fullAttempt: QuizAttempt = {
      ...attemptData,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      timestamp: Date.now()
    };

    history.push(fullAttempt);
    localStorage.setItem(SCORES_KEY, JSON.stringify(history));
  },

  getQuizAttempts: (userId?: string): QuizAttempt[] => {
    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (userId) return history.filter(a => a.userId === userId);
    return history;
  },

  getSessionRankings: (sessionId: string): QuizAttempt[] => {
    const history: QuizAttempt[] = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    return history
      .filter(a => a.sessionId === sessionId)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTaken - b.timeTaken; // Faster is better for same score
      });
  }
};
