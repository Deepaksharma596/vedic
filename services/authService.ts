
import { UserProfile } from '../types';

const STORAGE_KEY = 'vediq_user_session';

export const authService = {
  
  // Mock Login (Simulates Email/OTP or Google)
  async login(email: string): Promise<UserProfile> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists in local storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }

    // Create new user
    const newUser: UserProfile = {
      uuid: crypto.randomUUID(),
      email,
      username: email.split('@')[0],
      displayId: `VEDIQ-${Math.floor(1000 + Math.random() * 9000)}`,
      joinedAt: new Date(),
      searchCount: 0,
      isPremium: false,
      recentChats: []
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  async getSession(): Promise<UserProfile | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  async incrementSearchCount(user: UserProfile): Promise<UserProfile> {
    const updatedUser = {
      ...user,
      searchCount: user.searchCount + 1
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  async upgradeToPremium(user: UserProfile): Promise<UserProfile> {
    const updatedUser = {
      ...user,
      isPremium: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  async addRecentChat(user: UserProfile, chatTitle: string): Promise<UserProfile> {
    // Keep only last 10 chats
    const updatedChats = [chatTitle, ...user.recentChats].slice(0, 10);
    const updatedUser = {
      ...user,
      recentChats: updatedChats
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
};
