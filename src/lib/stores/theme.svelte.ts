import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

class ThemeStore {
  #theme = $state<Theme>('light');
  #mounted = $state(false);

  constructor() {
    if (browser) {
      this.initialize();
    }
  }

  get theme() {
    return this.#theme;
  }

  get mounted() {
    return this.#mounted;
  }

  private initialize() {
    // Get stored theme or system preference
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.#theme = stored || (prefersDark ? 'dark' : 'light');
    this.#mounted = true;
    
    // Apply the theme
    this.applyTheme(this.#theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        // Only auto-switch if user hasn't manually set a theme
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
  }

  private applyTheme(theme: Theme) {
    if (!browser) return;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme: Theme) {
    this.#theme = theme;
    this.applyTheme(theme);
    
    if (browser) {
      localStorage.setItem('theme', theme);
    }
  }

  toggleTheme() {
    this.setTheme(this.#theme === 'light' ? 'dark' : 'light');
  }
}

export const themeStore = new ThemeStore();