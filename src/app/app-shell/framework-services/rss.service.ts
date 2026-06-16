import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from './ui/loading.service';
import { SessionStorageService } from './storage/session.storage.service';

export interface RssItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source: string;
    category: string;
    image: string;
}

@Injectable({ providedIn: 'root' })
export class RssService {

    private readonly client = inject(HttpClient);
    private readonly config = inject(AppConfigService);
    private readonly loading = inject(LoadingService);
    protected readonly session = inject(SessionStorageService);
    private baseUrl: string;

    constructor() {
        this.baseUrl = this.config.apiUrl + 'Kits/';
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('PIC', this.session.personInfoRef)
            .set('SessionId', this.session.sessionId)
            .set('UserId', this.session.userId)
            .set('UserName', encodeURIComponent(this.session.userName));
    }

    private withLoading<T>(obs$: Observable<T>): Observable<T> {
        this.loading.show();
        return obs$.pipe(finalize(() => this.loading.hide()));
    }

    // ✅ JSON version (Backend باید Ok(items) بده)
    getRssBySource(name: string): Observable<RssItem[]> {

        const params = new HttpParams().set('name', name);

        return this.withLoading(
            this.client.get<RssItem[]>(
                this.baseUrl + 'GetRssBySource',
                {
                    headers: this.getHeaders(),
                    params
                }
            )
        );
    }
}