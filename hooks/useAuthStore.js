import { create } from 'zustand';
import { auth } from '../firebase-auth/index';
import { onAuthStateChanged } from 'firebase/auth';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, (currentUser) => {
        set({ user: currentUser || null, loading: false });
      });
    }
  },

  setUser: (userData) => set({ user: userData }),

  signOutUser: async () => {
    try {
      await auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));

export default useAuthStore;
