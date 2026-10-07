import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridSettingsColumn, AgGridSettingsDialogService } from '../services/ag-grid-settings-dialog.service';

@Component({
  selector: 'app-ag-grid-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ag-grid-settings-dialog.component.html',
  styleUrl: './ag-grid-settings-dialog.component.scss',
})
export class AgGridSettingsDialogComponent {
  protected readonly dialog = inject(AgGridSettingsDialogService);
  protected readonly search = signal('');
  protected readonly filteredColumns = computed(() => {
    const state = this.dialog.state();
    const query = this.search().trim().toLocaleLowerCase('fa');
    if (!state) return [];
    return query
      ? state.columns.filter(item => `${item.caption} ${item.field}`.toLocaleLowerCase('fa').includes(query))
      : state.columns;
  });

  @HostListener('document:keydown.escape')
  protected escape(): void {
    if (this.dialog.state()) this.close();
  }

  protected close(): void {
    this.search.set('');
    this.dialog.close();
  }

  protected update(column: AgGridSettingsColumn, patch: Partial<AgGridSettingsColumn>): void {
    const state = this.dialog.state();
    if (!state) return;
    this.dialog.updateColumns(state.columns.map(item => item.id === column.id ? { ...item, ...patch } : item));
  }

  protected move(column: AgGridSettingsColumn, offset: number): void {
    const state = this.dialog.state();
    if (!state) return;
    const columns = [...state.columns];
    const from = columns.findIndex(item => item.id === column.id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= columns.length) return;
    [columns[from], columns[to]] = [columns[to], columns[from]];
    this.dialog.updateColumns(columns);
  }

  protected setAllVisible(visible: boolean): void {
    const state = this.dialog.state();
    if (!state) return;
    this.dialog.updateColumns(state.columns.map(item => ({ ...item, visible })));
  }
}
