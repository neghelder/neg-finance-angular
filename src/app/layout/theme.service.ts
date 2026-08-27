import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';
  
  // Initialize with a default, but we'll immediately determine the correct theme in constructor
  readonly activeTheme = signal<Theme>('dark');

  constructor() {
    this.initializeTheme();
    
    // Create an effect to automatically apply the theme class to the body element
    // and persist the preference whenever it changes
    effect(() => {
      const theme = this.activeTheme();
      this.applyThemeClass(theme);
      this.saveThemePreference(theme);
    });
  }

  toggleTheme(): void {
    this.activeTheme.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.activeTheme.set(theme);
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.activeTheme.set(savedTheme);
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.activeTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference to localStorage', e);
    }
  }

  private applyThemeClass(theme: Theme): void {
    // Only works in browser environment, safely apply to document body
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }
}
