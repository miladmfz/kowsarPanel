import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import { ProductOnlineConfigService } from './product-online-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductOnlineThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly productConfig = inject(ProductOnlineConfigService);

  apply(): void {
    const theme = this.productConfig.theme;
    const root = this.document.documentElement;

    root.style.setProperty('--product-background', theme.background);
    root.style.setProperty('--product-surface', theme.surface);
    root.style.setProperty('--product-primary', theme.primary);
    root.style.setProperty('--product-accent', theme.accent);
    root.style.setProperty('--product-text', theme.text);
    root.style.setProperty('--product-muted', theme.muted);
    root.style.setProperty('--product-border', this.rgba(theme.text, 0.12));
    root.style.setProperty('--product-primary-soft', this.rgba(theme.primary, 0.1));
    root.style.setProperty('--product-primary-border', this.rgba(theme.primary, 0.28));
    root.style.setProperty('--product-accent-soft', this.rgba(theme.accent, 0.15));
    root.style.setProperty('--product-image-background', this.rgba(theme.text, 0.045));
    root.style.setProperty('--product-shadow-sm', `0 6px 18px ${this.rgba(theme.text, 0.08)}`);
    root.style.setProperty('--product-shadow-md', `0 18px 46px ${this.rgba(theme.text, 0.13)}`);
    root.style.setProperty(
      '--product-page-background',
      `radial-gradient(circle at top right, ${this.rgba(theme.accent, 0.13)}, transparent 28%),
       radial-gradient(circle at bottom left, ${this.rgba(theme.primary, 0.09)}, transparent 30%),
       ${theme.background}`
    );
  }

  private rgba(hex: string, alpha: number): string {
    const normalized = String(hex ?? '').replace('#', '').trim();

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const red = Number.parseInt(normalized.substring(0, 2), 16);
    const green = Number.parseInt(normalized.substring(2, 4), 16);
    const blue = Number.parseInt(normalized.substring(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
}
