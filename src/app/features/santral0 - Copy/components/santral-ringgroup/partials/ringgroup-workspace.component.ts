import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="row g-3">

    <div class="col-lg-5">
      <div class="card kws-list-card">
        <div class="card-header kws-card-header">
          <div>
            <strong>لیست گروه‌های تماس</strong>
            <small>برای مشاهده جزئیات، یک گروه را انتخاب کنید</small>
          </div>
        </div>

        <div class="card-body p-0">

          @if (vm.loading()) {
          <div class="kws-empty-state">
            <span class="spinner-border spinner-border-sm mb-2"></span>
            <div>در حال دریافت گروه‌های تماس...</div>
          </div>
          }

          @if (!vm.loading() && vm.filteredGroups().length === 0) {
          <div class="kws-empty-state">
            <i class="mdi mdi-phone-incoming-outline"></i>
            <div>گروهی پیدا نشد</div>
          </div>
          }

          @if (!vm.loading() && vm.filteredGroups().length > 0) {
          <div class="kws-group-list">

            @for (group of vm.filteredGroups(); track vm.trackByGroup($index, group)) {
            <button type="button" class="kws-group-card" [class]="vm.getGroupCardClass(group)"
              (click)="vm.selectGroup(group)">

              <div class="kws-group-card-top">
                <div>
                  <strong>
                    {{ vm.toFaNumber(group.grpnum) }} - {{ group.description_fa }}
                  </strong>

                  <span>
                    {{ group.description }}
                  </span>
                </div>

                <span class="kws-strategy-badge" [class]="vm.getStrategyBadgeClass(group.strategy)">

                  {{ group.strategy_fa }}
                </span>
              </div>

              <div class="kws-group-card-bottom">
                <span>
                  <i class="mdi mdi-account-multiple-outline"></i>
                  {{ vm.toFaNumber(group.members_count) }} داخلی
                </span>

                <span>
                  <i class="mdi mdi-timer-outline"></i>
                  {{ vm.toFaNumber(group.grptime) }} ثانیه
                </span>
              </div>

            </button>
            }

          </div>
          }

        </div>
      </div>
    </div>

    <div class="col-lg-7">

      @if (!vm.selectedGroup()) {
      <div class="card kws-detail-card">
        <div class="kws-empty-state">
          <i class="mdi mdi-phone-forward-outline"></i>
          <div>یک گروه تماس را انتخاب کنید</div>
        </div>
      </div>
      }

      @if (vm.selectedGroup()) {
      <div class="card kws-detail-card">

        <div class="card-header kws-detail-header">
          <div>
            <h5>
              {{ vm.toFaNumber(vm.selectedGroup()?.grpnum) }} - {{ vm.selectedGroup()?.description_fa }}
            </h5>

            <span>
              {{ vm.selectedGroup()?.description }}
            </span>
          </div>
          <div class="kws-detail-actions">

            <span class="kws-strategy-badge" [class]="vm.getStrategyBadgeClass(vm.selectedGroup()?.strategy || '')">

              {{ vm.selectedGroup()?.strategy_fa }}
            </span>

            <button type="button" class="btn btn-sm btn-primary" (click)="vm.openEditBasic(vm.selectedGroup())">

              <i class="mdi mdi-pencil-outline ms-1"></i>
              ویرایش
            </button>

          </div>
          <span class="kws-strategy-badge" [class]="vm.getStrategyBadgeClass(vm.selectedGroup()?.strategy || '')">

            {{ vm.selectedGroup()?.strategy_fa }}
          </span>
        </div>

        <div class="card-body">

          <div class="kws-detail-grid">

            <div class="kws-detail-item">
              <span>کد گروه تماس</span>
              <strong>{{ vm.toFaNumber(vm.selectedGroup()?.grpnum) }}</strong>
            </div>

            <div class="kws-detail-item">
              <span>عنوان فارسی</span>
              <strong>{{ vm.selectedGroup()?.description_fa }}</strong>
            </div>

            <div class="kws-detail-item">
              <span>نوع زنگ خوردن</span>
              <strong>{{ vm.selectedGroup()?.strategy_fa }}</strong>
            </div>

            <div class="kws-detail-item">
              <span>مدت زنگ خوردن</span>
              <strong>{{ vm.toFaNumber(vm.selectedGroup()?.grptime || 0) }} ثانیه</strong>
            </div>

            <div class="kws-detail-item kws-detail-item-wide">
              <div class="kws-postdest-row">
                <div>
                  <span>رفتار بعد از عدم پاسخ</span>
                  <strong>{{ vm.getPostDestText(vm.selectedGroup()?.postdest || '') }}</strong>
                </div>

                <button type="button" class="btn btn-sm btn-outline-primary"
                  (click)="vm.openEditPostDest(vm.selectedGroup())">

                  <i class="mdi mdi-phone-forward-outline ms-1"></i>
                  ویرایش مقصد
                </button>
              </div>
            </div>

          </div>

          <div class="kws-section-title kws-section-title-action">
            <span>
              اعضای گروه تماس
            </span>

            <button type="button" class="btn btn-sm btn-outline-primary" (click)="vm.openEditMembers(vm.selectedGroup())">

              <i class="mdi mdi-account-edit-outline ms-1"></i>
              ویرایش اعضا
            </button>
          </div>

          <div class="kws-member-list">

            @for (member of vm.selectedGroup()?.members || []; track vm.trackByMember($index, member)) {
            <div class="kws-member-chip">
              <span class="kws-member-ext">
                {{ vm.toFaNumber(member.extension) }}
              </span>

              <span class="kws-member-name">
                {{ member.name }}
              </span>
            </div>
            }

          </div>

          <div class="kws-section-title">
            لیست خام داخلی‌ها
          </div>

          <div class="kws-raw-box">
            {{ vm.toFaNumber(vm.selectedGroup()?.grplist || '') }}
          </div>

        </div>
      </div>
      }

    </div>

  </div>
`
})
export class RinggroupWorkspaceComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
