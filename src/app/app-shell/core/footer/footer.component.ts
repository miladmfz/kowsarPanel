import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
    AppVersion: string = '';

    constructor(
        private config: AppConfigService
    ) { }
    ngOnInit() {
        this.AppVersion = this.config.AppVersion

    }

    currentYear = new Date().getFullYear();

}
