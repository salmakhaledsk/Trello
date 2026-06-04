import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.isDark());
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    this.save(next);
  }

  applyTheme(dark: boolean) {
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  save(dark: boolean) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  getInitialTheme(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  }
}
