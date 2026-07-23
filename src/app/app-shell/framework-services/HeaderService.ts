
import { inject, Injectable } from '@angular/core';
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
            // .set('Access-Control-Allow-Origin', '*')

            .set('PIC', String(this.session.personInfoRef ?? ''))
            .set('CR', String(this.session.centralRef ?? ''))
            .set('SI', String(this.session.sessionId ?? ''))
            .set('UI', String(this.session.userId ?? ''))
            .set(
                'UN',
                encodeURIComponent(String(this.session.userName ?? ''))
            );
    }
}