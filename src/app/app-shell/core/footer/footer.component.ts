import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
    AppVersion = signal('')
    private readonly config = inject(AppConfigService);

    constructor() { }
    ngOnInit() {
        this.AppVersion.set(this.config.AppVersion)

    }

    currentYear = new Date().getFullYear();

}
