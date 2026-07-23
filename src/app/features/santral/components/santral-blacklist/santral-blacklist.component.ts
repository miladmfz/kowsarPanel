import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  SantralBlacklistItem,
  SantralBlacklistResponse,
  SantralWebApiService
} from '../../services/santralapi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';


interface SantralBlacklistGroup {
  mainNumber: string;
  variants: string[];
}

@Component({
  selector: 'app-santral-blacklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './santral-blacklist.component.html',
  styleUrl: './santral-blacklist.component.css'
})
export class SantralBlacklistComponent implements OnInit {

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  deletingNumber = signal<string>('');

  newNumber = signal<string>('');
  searchText = signal<string>('');

  items = signal<SantralBlacklistItem[]>([]);

  groups = computed<SantralBlacklistGroup[]>(() => {
    const map = new Map<string, string[]>();

    this.items().forEach(item => {
      const number = String(item.number || '').trim();

      if (!number) {
        return;
      }

      const mainNumber = this.getMainIranNumber(number);

      if (!map.has(mainNumber)) {
        map.set(mainNumber, []);
      }

      const variants = map.get(mainNumber)!;

      if (!variants.includes(number)) {
        variants.push(number);
      }
    });

    return Array.from(map.entries())
      .map(([mainNumber, variants]) => {
        return {
          mainNumber,
          variants
        };
      })
      .sort((a, b) => a.mainNumber.localeCompare(b.mainNumber));
  });

  filteredGroups = computed<SantralBlacklistGroup[]>(() => {
    const search = this.cleanNumber(this.searchText());

    if (!search) {
      return this.groups();
    }

    return this.groups().filter(group => {
      const text = [
        group.mainNumber,
        ...group.variants
      ].join(' ');

      return text.includes(search);
    });
  });


  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);


  constructor() { }

  ngOnInit(): void {
    this.loadBlacklist();
  }

  loadBlacklist(): void {
    this.loading.set(true);

    this.santralApi.GetSantralBlacklist(false)
      .subscribe({
        next: (res: SantralBlacklistResponse) => {
          this.loading.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت لیست سیاه');
            return;
          }

          const items = Array.isArray(res?.items) ? res.items : [];
          this.items.set(items);
        },
        error: () => {
          this.loading.set(false);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  addBlacklist(): void {
    const number = this.newNumber().trim();

    if (!number) {
      this.notificationService.warning('شماره را وارد کنید');
      return;
    }

    const cleanNumber = this.cleanNumber(number);

    if (!/^[0-9]{5,15}$/.test(cleanNumber)) {
      this.notificationService.warning('شماره وارد شده نامعتبر است');
      return;
    }

    this.saving.set(true);

    this.santralApi.AddSantralBlacklist(number, false)
      .subscribe({
        next: (res: any) => {
          this.saving.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در افزودن شماره');
            return;
          }

          this.notificationService.success(res?.ErrDesc || 'شماره به لیست سیاه اضافه شد');

          this.newNumber.set('');
          this.loadBlacklist();
        },
        error: () => {
          this.saving.set(false);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  deleteBlacklist(group: SantralBlacklistGroup): void {
    const number = group.mainNumber;

    if (!number) {
      return;
    }

    this.deletingNumber.set(number);

    this.santralApi.DeleteSantralBlacklist(number, false)
      .subscribe({
        next: (res: any) => {
          this.deletingNumber.set('');

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در حذف شماره');
            return;
          }

          this.notificationService.success(res?.ErrDesc || 'شماره از لیست سیاه حذف شد');

          this.loadBlacklist();
        },
        error: () => {
          this.deletingNumber.set('');
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  setNewNumber(value: string): void {
    this.newNumber.set(value);
  }

  setSearchText(value: string): void {
    this.searchText.set(value);
  }

  cleanNumber(value: string): string {
    return String(value || '')
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .replace(/\+/g, '')
      .replace(/[^0-9]/g, '');
  }

  getMainIranNumber(value: string): string {
    const number = this.cleanNumber(value);

    if (number.startsWith('98') && number.length === 12) {
      return '0' + number.substring(2);
    }

    if (number.startsWith('9') && number.length === 10) {
      return '0' + number;
    }

    return number;
  }

  toFaNumber(value: string | number): string {
    const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return String(value ?? '').replace(/\d/g, digit => {
      return faDigits[Number(digit)];
    });
  }

}