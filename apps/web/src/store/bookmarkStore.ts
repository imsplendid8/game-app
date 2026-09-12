import { create } from 'zustand';

export interface BookmarkedExperience {
  id: number;
  name: string;
  institution: string;
  price: number;
  ageGroup: string;
  rating: number;
  bookmarkedAt: string;
}

export interface BookmarkState {
  bookmarks: BookmarkedExperience[];
  addBookmark: (experience: BookmarkedExperience) => void;
  removeBookmark: (experienceId: number) => void;
  isBookmarked: (experienceId: number) => boolean;
  hydrate: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],

  addBookmark: (experience) => {
    const state = get();
    if (!state.isBookmarked(experience.id)) {
      const bookmarks = [...state.bookmarks, experience];
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      set({ bookmarks });
    }
  },

  removeBookmark: (experienceId) => {
    const state = get();
    const bookmarks = state.bookmarks.filter((b) => b.id !== experienceId);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    set({ bookmarks });
  },

  isBookmarked: (experienceId) => {
    return get().bookmarks.some((b) => b.id === experienceId);
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const bookmarksStr = localStorage.getItem('bookmarks');
      if (bookmarksStr) {
        try {
          const bookmarks = JSON.parse(bookmarksStr);
          set({ bookmarks });
        } catch {
          // ignore parse errors
        }
      }
    }
  },
}));
