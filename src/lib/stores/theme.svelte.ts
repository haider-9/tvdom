import { browser } from "$app/environment";

export type Theme = "light" | "dark" | "bubblegum" | "cyberpunk" | "doom65" | "claymorphism";

class ThemeStore {
  #theme = $state<Theme>("bubblegum");
  #isInitialized = $state(false);

  constructor() {
    if (browser) {
      this.#initialize();
    }
  }

  get theme() {
    return this.#theme;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  #initialize() {
    try {
      // Get stored theme
      const stored = localStorage.getItem("tvdom-theme");
      const theme = (stored as Theme) || "bubblegum";

      // Validate theme
      if (stored && !["light", "dark", "bubblegum", "cyberpunk", "doom65", "claymorphism"].includes(stored)) {
        this.#theme = "bubblegum";
      } else {
        this.#theme = theme;
      }

      // Apply immediately
      this.#applyTheme(this.#theme);

      this.#isInitialized = true;

      console.log("Theme initialized:", this.#theme);
    } catch (error) {
      console.warn("Theme initialization failed:", error);
      this.#theme = "bubblegum";
      this.#applyTheme("bubblegum");
      this.#isInitialized = true;
    }
  }

  #applyTheme(theme: Theme) {
    if (!browser || !document.documentElement) return;

    const html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove("dark", "theme-bubblegum", "theme-cyberpunk", "theme-doom65", "theme-claymorphism");

    // Apply new theme
    switch (theme) {
      case "dark":
        html.classList.add("dark");
        html.setAttribute("data-theme", "dark");
        break;
      case "bubblegum":
        html.classList.add("theme-bubblegum");
        html.setAttribute("data-theme", "bubblegum");
        break;
      case "cyberpunk":
        html.classList.add("theme-cyberpunk");
        html.setAttribute("data-theme", "cyberpunk");
        break;
      case "doom65":
        html.classList.add("theme-doom65");
        html.setAttribute("data-theme", "doom65");
        break;
      case "claymorphism":
        html.classList.add("theme-claymorphism");
        html.setAttribute("data-theme", "claymorphism");
        break;
      case "light":
      default:
        html.setAttribute("data-theme", "light");
        break;
    }

    console.log("Theme applied:", theme);
  }

  setTheme(theme: Theme) {
    if (!this.#isInitialized) return;

    this.#theme = theme;
    this.#applyTheme(theme);

    // Save to localStorage
    try {
      localStorage.setItem("tvdom-theme", theme);
      console.log("Theme saved:", theme);
    } catch (error) {
      console.warn("Failed to save theme:", error);
    }
  }

  toggleTheme() {
    const themes: Theme[] = ["bubblegum", "light", "dark", "cyberpunk", "doom65", "claymorphism"];
    const currentIndex = themes.indexOf(this.#theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
}

export const themeStore = new ThemeStore();

// Apply theme immediately on page load to prevent flash
if (browser) {
  const initTheme = () => {
    const stored = localStorage.getItem("tvdom-theme") || "bubblegum";
    const html = document.documentElement;

    html.classList.remove("dark", "theme-bubblegum", "theme-cyberpunk", "theme-doom65", "theme-claymorphism");

    if (stored === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else if (stored === "bubblegum") {
      html.classList.add("theme-bubblegum");
      html.setAttribute("data-theme", "bubblegum");
    } else if (stored === "cyberpunk") {
      html.classList.add("theme-cyberpunk");
      html.setAttribute("data-theme", "cyberpunk");
    } else if (stored === "doom65") {
      html.classList.add("theme-doom65");
      html.setAttribute("data-theme", "doom65");
    } else if (stored === "claymorphism") {
      html.classList.add("theme-claymorphism");
      html.setAttribute("data-theme", "claymorphism");
    } else {
      html.setAttribute("data-theme", "light");
    }

    console.log("Initial theme applied:", stored);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
}
