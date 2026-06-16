import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

import { Group } from 'src/app/features/menu-online/models/group';

@Component({
  selector: 'app-single-group',
  templateUrl: './single-group.component.html',
  styleUrls: ['./single-group.component.css'],

  standalone: true,
  imports: [
    CommonModule
  ]
})
export class SingleGroupComponent implements OnInit {
  protected readonly session = inject(SessionStorageService);
  readonly config =
    inject(AppConfigService);

  @Input()
  item!: Group;

  @Input()
  selectedGroupCode: string = '';

  @Output()
  Group_Selected =
    new EventEmitter<Group>();

  ngOnInit(): void {
  }

  SelectGroup(item: Group): void {

    this.session.setItem(
      'DefaultGroupCode',
      item.GroupCode ?? ''
    );

    this.Group_Selected.emit(item);
  }

  isSelected(item: Group): boolean {

    return this.selectedGroupCode === item.GroupCode;
  }

}