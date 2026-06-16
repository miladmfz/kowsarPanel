import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'theme';
    private readonly lightTheme = {
        bs: 'assets/css/modern/bootstrap-rtl.min.css',
        app: 'assets/css/modern/app-rtl.min.css'
    };
    private readonly darkTheme = {
        bs: 'assets/css/modern/bootstrap-dark-rtl.min.css',
        app: 'assets/css/modern/app-dark-rtl.min.css'
    };

    //    اضافه شد: BehaviorSubject برای اطلاع‌رسانی تغییر تم
    private currentThemeSubject = new BehaviorSubject<'light' | 'dark'>(this.getInitialTheme());
    theme$ = this.currentThemeSubject.asObservable();

    constructor() { }

    /**   تم ذخیره‌شده یا پیش‌فرض */
    private getInitialTheme(): 'light' | 'dark' {
        return (localStorage.getItem(this.THEME_KEY) as 'light' | 'dark') || 'light';
    }

    /**   حالت فعلی تم */
    get currentTheme(): 'light' | 'dark' {
        return this.currentThemeSubject.value;
    }

    /**   اعمال تم هنگام لود برنامه */
    initTheme(): void {
        const savedTheme = this.getInitialTheme();
        this.applyTheme(savedTheme);
    }

    /** 🌗 تغییر تم (روشن ↔ تاریک) */
    toggleTheme(): void {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**   اعمال تم بر اساس مقدار */
    applyTheme(mode: 'light' | 'dark'): void {
        const bs = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
        const app = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
        const bsDark = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
        const appDark = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

        if (!bs || !app || !bsDark || !appDark) {
            console.warn('  ThemeService: Stylesheet elements not found.');
            return;
        }

        const isDark = mode === 'dark';
        bs.disabled = isDark;
        app.disabled = isDark;
        bsDark.disabled = !isDark;
        appDark.disabled = !isDark;

        document.documentElement.setAttribute('data-bs-theme', mode);
        localStorage.setItem(this.THEME_KEY, mode);

        //    ارسال نوتیف به تمام مشترکین
        this.currentThemeSubject.next(mode);


    }

    /** 🌞 روشن کردن تم */
    setLightTheme(): void {
        this.applyTheme('light');
    }

    /** 🌙 تاریک کردن تم */
    setDarkTheme(): void {
        this.applyTheme('dark');
    }
}
