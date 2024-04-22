import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { createGuid } from '../constants';
import { USER_ID_NAME } from '../../framework-services/configuration';
import { LocalStorageService } from '../../framework-services/local.storage.service';
import { NotificationService } from '../../framework-services/notification.service';
import { SwalService } from '../../framework-services/swal.service';
import { VoiceService } from '../../framework-services/voice.service';
declare var $: any;

@Component({
  selector: 'app-voice',
  templateUrl: './voice.component.html'
})
export class VoiceComponent implements OnInit {

  newVoice;
  currentUserId: number;

  @Input() table: string;
  @Input() isInViewMode: boolean;
  @Input() useSecondLang: boolean;

  @Input() set masterId(value) {
    this.voiceFrm.get('masterId').setValue(value);
  }

  @Output() count: EventEmitter<number> = new EventEmitter();

  voiceFrm = new FormGroup({
    masterId: new FormControl(),
    voices: new FormArray([])
  });

  get voices(): FormArray {
    return this.voiceFrm.get("voices") as FormArray;
  }

  constructor(private readonly fb: FormBuilder,
    private readonly voiceService: VoiceService,
    private readonly swalService: SwalService,
    private readonly notificationService: NotificationService,
    private readonly localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.getVoices();
  }

  createVoiceControl(voice = null,
    id = 0,
    creationDate = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    creatorName = '',
    creator = this.currentUserId) {

    return this.fb.group({
      id,
      guid: createGuid(),
      creationDate,
      creatorName,
      creator,
      voice,
      canEdit: false
    });

  }

  getVoices() {
    const masterId = this.voiceFrm.get('masterId').value;
    this.voiceService.getListByMasterId(masterId, this.table).subscribe(data => {
      data.forEach(voice => {
        const formGroup = this.createVoiceControl(voice.voice, voice.id, voice.creationDate, voice.creatorName,
          voice.creator);

        this.currentUserId = parseInt(this.localStorageService.getItem(USER_ID_NAME));
        if (formGroup.get('creator').value !== this.currentUserId) {
          formGroup.disable();
        }

        this.voices.push(formGroup);
      });

      this.emitCount();
    });
  }

  addVoice() {
    const voice = this.createVoiceControl(this.newVoice);
    this.submit(voice);
    this.newVoice = '';
    $('#newVoice').focus();
  }

  removeVoice(index) {
    this.swalService.fireSwal("آیا از حذف یادداشت اطمینان دارید؟", "توجه داشته باشید که حذف اطلاعات وابسته سند، در لحظه اعمال خواهد شد.")
      .then((t: { value: boolean; }) => {
        if (t.value === true) {
          const id = this.voices.controls[index].get('id').value;
          if (!id) return;
          this.voiceService.deleteNote(this.table, id).subscribe(() => {
            this.voices.removeAt(index);
            this.emitCount();
          });
        } else {
          this.swalService.dismissSwal(t);
        }
      });
  }

  submit(voice) {
    const masterId = this.voiceFrm.get('masterId').value;
    const command = voice.value;

    if (!this.newVoice) {
      this.notificationService.error("لطفا صوت خود را ضبط کنید.");
      return;
    }

    var formData = new FormData();
    formData.append('id', command.id);
    formData.append('table', this.table);
    formData.append('engDescription', command.engDescription);
    formData.append('voice', this.newVoice);
    formData.append('masterId', masterId);

    if (command.id) {
      this.voiceService.edit(command).subscribe(data => {
        this.goToEditMode(voice, false);
      });
    } else {
      this.voiceService
        .createWithFile(formData)
        .subscribe((data: any) => {
          this.voices.push(voice);
          voice.get('id').setValue(data.id);
          voice.get('creatorName').setValue(data.creatorName);
          this.emitCount();
        });
    }
  }

  emitCount() {
    this.count.emit(this.voices.controls.length);
  }

  canEdit(note) {
    return note.get('canEdit').value;
  }

  goToEditMode(voice, mode) {
    const index = this.voices.controls.indexOf(voice);
    this.voices.controls[index].get('canEdit').setValue(mode);
  }

  setVoice(voice) {
    this.newVoice = voice;
  }
}