import { Directive, EventEmitter, ElementRef, AfterViewInit, Input, Output, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as _ from 'lodash';
import { ACCESS_TOKEN_NAME } from '../../framework-services/configuration';
import { LocalStorageService } from '../../framework-services/local.storage.service';
import { getServiceUrl } from 'src/environment/environment';

declare var $: any;

@Directive({
    selector: '[appSelect2]',
    providers: []
})
export class Select2Directive implements AfterViewInit {
    select2: any;

    @Input()
    dataUrl: string;

    @Input()
    placeholder: string;

    @Input()
    minimumInputLength: number = 0;

    @Input()
    ajaxUrl: string;


    _searchTerm: string;
    get searchTerm(): string {
        return this._searchTerm;
    }
    @Input() set searchTerm(value) {
        this._searchTerm = value;
        this.initializeSelect2();
    }

    // @Input()
    // searchTerm: string;

    @Input()
    selectedItem: { id: string, name: string };

    @Input()
    multiple;

    @Output()
    itemSelected = new EventEmitter<any>();

    constructor(private el: ElementRef,
        private control: NgControl,
        private renderer: Renderer2,
        private readonly localStorageService: LocalStorageService) { }

    ngAfterViewInit(): void {
        this.initializeSelect2();
    }

    initializeSelect2(): void {
        const config = {
            placeholder: this.placeholder || 'لطفا انتخاب کنید',
            dir: "rtl",
            // allowClear: true,
            minimumInputLength: this.minimumInputLength,
            language: {
                inputTooShort: function (args) {
                    return `حداقل ${args.minimum} کاراکتر وارد کنید`;
                },
                noResults: function () {
                    return "هیج نتیجه ای یافت نشد";
                },
                searching: function () {
                    return "درحال جستجو...";
                }
            }
        };

        if (this.ajaxUrl) {
            const token = this.localStorageService.getItem(ACCESS_TOKEN_NAME);
            var searchTerm = this.searchTerm;
            var baseUrl = `${getServiceUrl()}${this.ajaxUrl}`;
            config["ajax"] = {
                url: function (params) {
                    let term = params.term;
                    if (searchTerm) {
                        term = searchTerm.replace("{0}", params.term);
                        term = term.replaceAll("/", '');
                        term = term.replaceAll(/\//g, "");
                    }

                    return `${baseUrl}/${term}`
                },
                dataType: 'json',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json",
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            }
                        })
                    };
                }
            };
        }

        this.select2 = $(this.el.nativeElement).select2(config);

        if (this.selectedItem) {
            let option = new Option(this.selectedItem.name, this.selectedItem.id, true, true);
            this.select2.append(option).trigger("change");
        }

        // if (this.preSelected) {
        //     var option = new Option(this.preSelected.name, this.preSelected.id, true, true);
        //     this.select2.append(option).trigger('change');
        // }

        // this.renderer.addClass(this.el.nativeElement, "select2");
        this.renderer.addClass(this.el.nativeElement, "custom-select");

        if (this.multiple) {
            // this.renderer.setAttribute(this.el.nativeElement, 'multiple', 'multiple');
            this.select2.on('select2:select', (event) => {
                const selectedItem = event.params.data;
                let selectedValue = selectedItem.id;
                let controlValue;

                if (this.ajaxUrl) {
                    controlValue = [...$(`#${event.currentTarget.id}`)[0].options].map(o => o.value);
                } else {
                    controlValue = this.control.control.value;
                }

                let currentValue = []
                if (controlValue) {
                    if (typeof controlValue == 'number') {
                        currentValue = [controlValue];
                    } else {
                        currentValue = controlValue;
                    }
                }

                if (!isNaN(selectedItem)) {
                    currentValue.push(selectedValue);
                } else {
                    if (isNaN(selectedItem.id)) {
                        selectedValue = parseInt(selectedItem.id.split(": ")[1]);
                    } else {
                        selectedValue = selectedItem.id;
                    }

                    const existingValue = currentValue.find(x => x == selectedValue);
                    if (!existingValue) {
                        currentValue.push(selectedValue);
                    }
                }

                this.control.control.setValue(currentValue);
                this.itemSelected.emit(selectedItem);
            });

            this.select2.on('select2:unselect', (event) => {
                const selectedItem = event.params.data;
                const selectedVlaue = parseInt(selectedItem.id.split(": ")[1]);
                let currentValue = this.control.control.value ? this.control.control.value : [];
                const currentValueIndex = currentValue.findIndex(x => x == selectedVlaue);
                currentValue.splice(currentValueIndex, 1);
                this.control.control.setValue(currentValue);
                this.itemSelected.emit(selectedItem);
            });
        } else {
            this.select2.on('select2:select', (event) => {
                const selectedItem = event.params.data;
                this.control.control.setValue(selectedItem.id);
                this.itemSelected.emit(selectedItem);
            });
        }

        this.select2.on('select2:open', (event) => {
            this.control.control.markAsTouched();
        });

        this.select2.on('select2:clear', (event) => {
            const selectedItem = event.params.data;
            this.control.control.setValue(null);
            this.itemSelected.emit(selectedItem);
        });
    }

    clear() {
        if (this.select2) {
            this.select2.val(null).trigger('change');
            this.control.control.setValue(null);
        }
    }
}



