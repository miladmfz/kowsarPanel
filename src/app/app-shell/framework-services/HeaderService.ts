import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { SessionStorageService } from './storage/session.storage.service';

@Injectable({
    providedIn: 'root'
})
export class HeaderService {

    private readonly session = inject(SessionStorageService);

    get headers(): HttpHeaders {

        return new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Access-Control-Allow-Origin', '*')
            .set('PIC', this.session.personInfoRef)
            .set('CR', this.session.centralRef)
            .set('SI', this.session.sessionId)
            .set('UI', this.session.userId)
            .set('UN', encodeURIComponent(this.session.userName));
    }
}