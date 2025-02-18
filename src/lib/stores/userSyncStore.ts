import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserSyncState {
  lastSyncTime: Record<string, number>;
  setLastSyncTime: (userId: string) => void;
  shouldSync: (userId: string) => boolean;
}

const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const isServer = typeof window === 'undefined';

export const useUserSyncStore = create<UserSyncState>()(
  persist(
    (set, get) => ({
      lastSyncTime: {},
      setLastSyncTime: (userId: string) => 
        set((state) => ({
          lastSyncTime: {
            ...state.lastSyncTime,
            [userId]: Date.now()
          }
        })),
      shouldSync: (userId: string) => {
        const lastSync = get().lastSyncTime[userId];
        if (!lastSync) return true;
        return Date.now() - lastSync > SYNC_INTERVAL;
      }
    }),
    {
      name: 'user-sync-storage',
      storage: isServer
        ? createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          }))
        : undefined,
      partialize: (state) => ({ lastSyncTime: state.lastSyncTime })
    }
  )
); 