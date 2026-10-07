import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  SantralRingGroupDetails,
  SantralRingGroupMember,
  SantralRingGroupsDetailsResponse,
  SantralWebApiService
} from '../../services/santralapi.service';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { RinggroupPageHeaderComponent } from './partials/ringgroup-page-header.component';
import { RinggroupStatCardsComponent } from './partials/ringgroup-stat-cards.component';
import { RinggroupFilterCardComponent } from './partials/ringgroup-filter-card.component';
import { RinggroupWorkspaceComponent } from './partials/ringgroup-workspace.component';
import { RinggroupBasicModalComponent } from './partials/ringgroup-basic-modal.component';
import { RinggroupMembersModalComponent } from './partials/ringgroup-members-modal.component';
import { RinggroupPostdestModalComponent } from './partials/ringgroup-postdest-modal.component';

@Component({
  selector: 'app-santral-ringgroup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RinggroupPageHeaderComponent,
    RinggroupStatCardsComponent,
    RinggroupFilterCardComponent,
    RinggroupWorkspaceComponent,
    RinggroupBasicModalComponent,
    RinggroupMembersModalComponent,
    RinggroupPostdestModalComponent
  ],
  templateUrl: './santral-ringgroup.component.html',
  styleUrl: './santral-ringgroup.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SantralRingGroupComponent {

  readonly vm = this;

  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);







  membersModalOpen = signal<boolean>(false);
  membersGrpnum = signal<string>('');
  membersText = signal<string>('');
  newMember = signal<string>('');
  savingMembers = signal<boolean>(false);
  editModalOpen = signal<boolean>(false);
  createMode = signal<boolean>(false);
  editGrpnum = signal<string>('');
  editDescription = signal<string>('');
  editStrategy = signal<string>('ringall');
  editGrptime = signal<number>(20);
  savingBasic = signal<boolean>(false);
  groups = signal<SantralRingGroupDetails[]>([]);
  selectedGroupCode = signal<string>('');
  searchText = signal<string>('');
  applyingConfig = signal<boolean>(false);
  configDirty = signal<boolean>(false);
  loading = signal<boolean>(false);
  extensions = signal<any[]>([]);
  extensionSearch = signal<string>('');
  loadingExtensions = signal<boolean>(false);


  postDestModalOpen = signal<boolean>(false);
  postDestGrpnum = signal<string>('');
  postDestType = signal<'extension' | 'ringgroup' | 'ivr'>('extension');
  postDestValue = signal<string>('');
  savingPostDest = signal<boolean>(false);











  selectedGroup = computed(() => {
    const code = this.selectedGroupCode();

    if (!code) {
      return null;
    }

    return this.groups().find(x => String(x.grpnum) === String(code)) ?? null;
  });

  filteredGroups = computed(() => {
    const q = this.searchText().trim().toLowerCase();

    if (!q) {
      return this.groups();
    }

    return this.groups().filter(group => {
      const text = [
        group.grpnum,
        group.description,
        group.description_fa,
        group.strategy,
        group.strategy_fa,
        group.grplist,
        group.postdest
      ].join(' ').toLowerCase();

      return text.includes(q);
    });
  });

  totalGroups = computed(() => this.groups().length);

  totalMembers = computed(() => {
    return this.groups().reduce((sum, group) => sum + Number(group.members_count || 0), 0);
  });

  ringAllCount = computed(() => {
    return this.groups().filter(x => x.strategy === 'ringall').length;
  });

  huntCount = computed(() => {
    return this.groups().filter(x => x.strategy === 'hunt').length;
  });

  ngOnInit(): void {
    this.loadRingGroups();
    this.loadExtensions();
  }

  loadRingGroups(): void {
    this.loading.set(true);

    this.santralApi.GetSantralRingGroupsDetails(false)
      .subscribe({
        next: (res: SantralRingGroupsDetailsResponse) => {
          this.loading.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت گروه‌های تماس');
            return;
          }

          const items = Array.isArray(res?.groups)
            ? res.groups
            : [];

          this.groups.set(items);

          if (items.length > 0 && !this.selectedGroupCode()) {
            this.selectedGroupCode.set(String(items[0].grpnum));
          }
        },
        error: () => {
          this.loading.set(false);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  selectGroup(group: SantralRingGroupDetails): void {
    this.selectedGroupCode.set(String(group.grpnum));
  }

  setSearchText(value: string): void {
    this.searchText.set(value);
  }

  getPostDestText(postdest: string): string {
    const value = String(postdest || '').trim();

    if (!value) {
      return 'نامشخص';
    }

    const parts = value.split(',');

    if (parts.length < 2) {
      return value;
    }

    const type = parts[0];
    const target = parts[1];

    if (type === 'from-did-direct') {
      return `بعد از عدم پاسخ، تماس به داخلی ${this.toFaNumber(target)} منتقل می‌شود`;
    }

    if (type === 'ext-group') {
      return `بعد از عدم پاسخ، تماس به گروه ${this.toFaNumber(target)} منتقل می‌شود`;
    }

    if (type.startsWith('ivr')) {
      return 'بعد از عدم پاسخ، تماس به منوی صوتی منتقل می‌شود';
    }

    return value;
  }

  getStrategyBadgeClass(strategy: string): string {
    if (strategy === 'ringall') {
      return 'kws-badge-ringall';
    }

    if (strategy === 'hunt') {
      return 'kws-badge-hunt';
    }

    return 'kws-badge-default';
  }

  getGroupCardClass(group: SantralRingGroupDetails): string {
    return String(group.grpnum) === String(this.selectedGroupCode())
      ? 'kws-group-card-active'
      : '';
  }

  toFaNumber(value: number | string | null | undefined): string {
    const text = String(value ?? '');

    return text
      .replace(/0/g, '۰')
      .replace(/1/g, '۱')
      .replace(/2/g, '۲')
      .replace(/3/g, '۳')
      .replace(/4/g, '۴')
      .replace(/5/g, '۵')
      .replace(/6/g, '۶')
      .replace(/7/g, '۷')
      .replace(/8/g, '۸')
      .replace(/9/g, '۹');
  }

  trackByGroup(index: number, item: SantralRingGroupDetails): string {
    return item.grpnum || String(index);
  }

  trackByMember(index: number, item: SantralRingGroupMember): string {
    return item.extension || String(index);
  }

  openEditBasic(group: SantralRingGroupDetails | null): void {
    if (!group) {
      return;
    }

    this.createMode.set(false);
    this.editGrpnum.set(String(group.grpnum || ''));
    this.editDescription.set(String(group.description || ''));
    this.editStrategy.set(String(group.strategy || 'ringall'));
    this.editGrptime.set(Number(group.grptime || 20));

    this.editModalOpen.set(true);
  }

  openCreateBasic(): void {
    this.createMode.set(true);
    this.editGrpnum.set('');
    this.editDescription.set('');
    this.editStrategy.set('ringall');
    this.editGrptime.set(20);
    this.editModalOpen.set(true);
  }

  closeEditBasic(): void {
    if (this.savingBasic()) {
      return;
    }

    this.editModalOpen.set(false);
    this.createMode.set(false);
  }

  saveBasic(): void {
    const grpnum = this.editGrpnum().trim();
    const description = this.editDescription().trim();
    const strategy = this.editStrategy().trim();
    const grptime = Number(this.editGrptime() || 0);

    if (!grpnum) {
      this.notificationService.warning('کد گروه تماس نامعتبر است');
      return;
    }

    if (!description) {
      this.notificationService.warning('عنوان گروه تماس را وارد کنید');
      return;
    }

    if (!strategy) {
      this.notificationService.warning('نوع زنگ خوردن را انتخاب کنید');
      return;
    }

    if (grptime < 5 || grptime > 120) {
      this.notificationService.warning('زمان زنگ خوردن باید بین ۵ تا ۱۲۰ ثانیه باشد');
      return;
    }

    this.savingBasic.set(true);

    const creating = this.createMode();

    this.santralApi.SaveSantralRingGroupBasic(
      grpnum,
      description,
      strategy,
      grptime,
      creating,
      false
    ).subscribe({
      next: (res: any) => {
        this.savingBasic.set(false);

        if (Number(res?.ErrCode) !== 0) {
          this.notificationService.error(res?.ErrDesc || 'خطا در ذخیره گروه تماس');
          return;
        }

        this.notificationService.success(res?.ErrDesc || 'اطلاعات گروه تماس ذخیره شد');
        this.configDirty.set(true);
        this.editModalOpen.set(false);
        this.createMode.set(false);

        if (creating) {
          this.selectedGroupCode.set(grpnum);
        }

        this.loadRingGroups();
      },
      error: () => {
        this.savingBasic.set(false);
        this.notificationService.error('خطا در ارتباط با سرور');
      }
    });
  }
  openEditMembers(group: SantralRingGroupDetails | null): void {
    if (!group) {
      return;
    }

    this.membersGrpnum.set(String(group.grpnum || ''));
    this.membersText.set(String(group.grplist || ''));
    this.newMember.set('');

    this.membersModalOpen.set(true);
  }

  closeEditMembers(): void {
    if (this.savingMembers()) {
      return;
    }

    this.membersModalOpen.set(false);
  }

  getEditingMembers(): string[] {
    return this.parseMembersText(this.membersText());
  }

  addMember(): void {
    const value = this.newMember().trim();

    if (!value) {
      this.notificationService.warning('شماره داخلی را وارد کنید');
      return;
    }

    if (!/^[0-9]{2,8}$/.test(value)) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    const members = this.getEditingMembers();

    if (members.includes(value)) {
      this.notificationService.warning('این داخلی قبلاً در گروه وجود دارد');
      return;
    }

    members.push(value);

    this.membersText.set(members.join('-'));
    this.newMember.set('');
  }

  removeMember(extension: string): void {
    const members = this.getEditingMembers()
      .filter(x => x !== extension);

    if (members.length === 0) {
      this.notificationService.warning('حداقل یک داخلی باید در گروه باقی بماند');
      return;
    }

    this.membersText.set(members.join('-'));
  }

  saveMembers(): void {
    const grpnum = this.membersGrpnum().trim();
    const members = this.getEditingMembers();

    if (!grpnum) {
      this.notificationService.warning('کد گروه تماس نامعتبر است');
      return;
    }

    if (members.length === 0) {
      this.notificationService.warning('حداقل یک داخلی وارد کنید');
      return;
    }

    const membersText = members.join('-');

    this.savingMembers.set(true);

    this.santralApi.SaveSantralRingGroupMembers(
      grpnum,
      membersText,
      false
    ).subscribe({
      next: (res: any) => {
        this.savingMembers.set(false);

        if (Number(res?.ErrCode) !== 0) {
          this.notificationService.error(res?.ErrDesc || 'خطا در ذخیره اعضای گروه تماس');
          return;
        }

        this.notificationService.success(res?.ErrDesc || 'اعضای گروه تماس ذخیره شد');
        this.configDirty.set(true);
        this.membersModalOpen.set(false);
        this.loadRingGroups();
      },
      error: () => {
        this.savingMembers.set(false);
        this.notificationService.error('خطا در ارتباط با سرور');
      }
    });
  }

  private parseMembersText(value: string): string[] {
    const parts = String(value || '')
      .split(/[-,\s]+/)
      .map(x => x.trim())
      .filter(x => x !== '');

    const unique: string[] = [];

    parts.forEach(x => {
      if (/^[0-9]{2,8}$/.test(x) && !unique.includes(x)) {
        unique.push(x);
      }
    });

    return unique;
  }
  applyConfig(): void {
    this.applyingConfig.set(true);

    this.santralApi.ApplySantralConfig(false)
      .subscribe({
        next: (res: any) => {
          this.applyingConfig.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در اعمال تنظیمات سانترال');
            return;
          }

          this.configDirty.set(false);
          this.notificationService.success(res?.ErrDesc || 'تنظیمات سانترال اعمال شد');
        },
        error: () => {
          this.applyingConfig.set(false);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }
  loadExtensions(): void {
    this.loadingExtensions.set(true);

    this.santralApi.GetSantralExtensionsForEdit(false)
      .subscribe({
        next: (res: any) => {
          this.loadingExtensions.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت لیست داخلی‌ها');
            return;
          }

          const items =
            Array.isArray(res?.extensions) ? res.extensions :
              Array.isArray(res?.users) ? res.users :
                Array.isArray(res?.data) ? res.data :
                  Array.isArray(res) ? res :
                    [];

          this.extensions.set(items);
        },
        error: () => {
          this.loadingExtensions.set(false);
          this.notificationService.error('خطا در دریافت لیست داخلی‌ها');
        }
      });
  }

  getExtensionCode(item: any): string {
    return String(
      item?.extension ??
      item?.Extension ??
      item?.id ??
      item?.Id ??
      item?.user ??
      item?.User ??
      item?.number ??
      ''
    ).trim();
  }

  getExtensionName(item: any): string {
    return String(
      item?.name ??
      item?.Name ??
      item?.display_name ??
      item?.displayName ??
      item?.description ??
      item?.Description ??
      this.getExtensionCode(item)
    ).trim();
  }

  setExtensionSearch(value: string): void {
    this.extensionSearch.set(value);
  }

  filteredAvailableExtensions(): any[] {
    const q = this.extensionSearch().trim().toLowerCase();
    const currentMembers = this.getEditingMembers();

    return this.extensions()
      .filter(item => {
        const code = this.getExtensionCode(item);

        if (!code) {
          return false;
        }

        if (currentMembers.includes(code)) {
          return false;
        }

        const name = this.getExtensionName(item);

        if (!q) {
          return true;
        }

        return `${code} ${name}`.toLowerCase().includes(q);
      })
      .slice(0, 50);
  }

  addMemberFromExtension(item: any): void {
    const code = this.getExtensionCode(item);

    if (!code) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    if (!/^[0-9]{2,8}$/.test(code)) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    const members = this.getEditingMembers();

    if (members.includes(code)) {
      this.notificationService.warning('این داخلی قبلاً در گروه وجود دارد');
      return;
    }

    members.push(code);

    this.membersText.set(members.join('-'));
    this.extensionSearch.set('');
  }

  openEditPostDest(group: SantralRingGroupDetails | null): void {
    if (!group) {
      return;
    }

    const parsed = this.parsePostDest(group.postdest || '');

    this.postDestGrpnum.set(String(group.grpnum || ''));
    this.postDestType.set(parsed.type);
    this.postDestValue.set(parsed.value);

    this.postDestModalOpen.set(true);
  }

  closeEditPostDest(): void {
    if (this.savingPostDest()) {
      return;
    }

    this.postDestModalOpen.set(false);
  }

  savePostDest(): void {
    const grpnum = this.postDestGrpnum().trim();
    const destType = this.postDestType();
    const destValue = this.postDestValue().trim();

    if (!grpnum) {
      this.notificationService.warning('کد گروه تماس نامعتبر است');
      return;
    }

    if (!destValue) {
      this.notificationService.warning('مقصد بعد از عدم پاسخ را وارد کنید');
      return;
    }

    if (!/^[0-9]{1,8}$/.test(destValue)) {
      this.notificationService.warning('شماره مقصد نامعتبر است');
      return;
    }

    this.savingPostDest.set(true);

    this.santralApi.SaveSantralRingGroupPostDest(
      grpnum,
      destType,
      destValue,
      false
    ).subscribe({
      next: (res: any) => {
        this.savingPostDest.set(false);

        if (Number(res?.ErrCode) !== 0) {
          this.notificationService.error(res?.ErrDesc || 'خطا در ذخیره مقصد بعد از عدم پاسخ');
          return;
        }

        this.notificationService.success(res?.ErrDesc || 'مقصد بعد از عدم پاسخ ذخیره شد');

        this.configDirty.set(true);

        this.postDestModalOpen.set(false);
        this.loadRingGroups();
      },
      error: () => {
        this.savingPostDest.set(false);
        this.notificationService.error('خطا در ارتباط با سرور');
      }
    });
  }

  parsePostDest(postdest: string): {
    type: 'extension' | 'ringgroup' | 'ivr';
    value: string;
  } {
    const value = String(postdest || '').trim();
    const parts = value.split(',');

    if (parts[0] === 'from-did-direct') {
      return {
        type: 'extension',
        value: parts[1] || ''
      };
    }

    if (parts[0] === 'ext-group') {
      return {
        type: 'ringgroup',
        value: parts[1] || ''
      };
    }

    if (parts[0]?.startsWith('ivr-')) {
      return {
        type: 'ivr',
        value: parts[0].replace('ivr-', '')
      };
    }

    return {
      type: 'extension',
      value: ''
    };
  }



























}
