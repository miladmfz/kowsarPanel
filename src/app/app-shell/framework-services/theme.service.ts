import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    private themeSubject = new BehaviorSubject<'light' | 'dark'>(this.getInitialTheme());
    theme$ = this.themeSubject.asObservable();

    constructor() {
        this.applyTheme(this.themeSubject.value);
    }

    private getInitialTheme(): 'light' | 'dark' {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }

    private applyTheme(mode: 'light' | 'dark') {
        const lightCss = [
            document.getElementById('bs-default-stylesheet') as HTMLLinkElement,
            document.getElementById('app-default-stylesheet') as HTMLLinkElement
        ].filter(el => el !== null);

        const darkCss = [
            document.getElementById('bs-dark-stylesheet') as HTMLLinkElement,
            document.getElementById('app-dark-stylesheet') as HTMLLinkElement
        ].filter(el => el !== null);

        if (mode === 'light') {
            lightCss.forEach(l => l.disabled = false);
            darkCss.forEach(l => l.disabled = true);
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        } else {
            lightCss.forEach(l => l.disabled = true);
            darkCss.forEach(l => l.disabled = false);
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        }

        // <-- اضافه کنید این قسمت برای هماهنگی data-layout-mode و data-layout
        document.body.setAttribute('data-layout-mode', mode);

        try {
            const layoutAttr = document.body.getAttribute('data-layout');
            if (layoutAttr) {
                const layout = JSON.parse(layoutAttr);
                layout.mode = mode;
                document.body.setAttribute('data-layout', JSON.stringify(layout));
            }
        } catch (e) {
            // اگه مقدار data-layout درست فرمت نبود نادیده بگیرید
            console.warn('Failed to update data-layout attribute', e);
        }

        localStorage.setItem('theme', mode);
    }


    setTheme(mode: 'light' | 'dark') {
        this.applyTheme(mode);
        this.themeSubject.next(mode);
    }

    toggleTheme() {
        const current = this.themeSubject.value;
        const newMode = current === 'light' ? 'dark' : 'light';
        this.setTheme(newMode);
    }
}
