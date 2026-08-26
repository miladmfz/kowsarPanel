import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

import {
    SantralBaseFilter,
    SantralBlacklistResponse,
    SantralCallRecordingResponse,
    SantralCallRecordingSaveRequest,
    SantralDefinitionsResponse,
    SantralExtensionMonitorHistoryResponse,
    SantralExtensionReportResponse,
    SantralExtensionMonitorSnapshotResponse,
    SantralFollowupFilter,
    SantralFollowupResponse,
    SantralLiveStatusResponse,
    SantralOperatorRankingsResponse,
    SantralPagedFilter,
    SantralRecordingMode,
    SantralRingGroupsDetailsResponse,
    SantralSpyMode,
    SantralSpyResponse
} from '../models/santral-api.models';

export * from '../models/santral-api.models';

@Injectable({
    providedIn: 'root'
})
export class SantralWebApiService {

    /**
     * مقدار پیشنهادی داخل app-config:
     * santralUrl: 'http://localhost:60009/login_cdr/index.php'
     *
     * اگر قبلاً اینطوری گذاشته باشی هم این سرویس خودش درستش می‌کند:
     * santralUrl: 'http://localhost:60009/login_cdr/index.php?tag='
     * santralUrl: 'http://localhost:60009/login_cdr/'
     */
    baseUrl = '';

    private activeLoadingRequests = 0;

    private readonly headerService = inject(HeaderService);
    private readonly client = inject(HttpClient);
    private readonly config = inject(AppConfigService);
    private readonly loadingService = inject(LoadingService);

    constructor() {
        this.baseUrl = this.normalizeBaseUrl(this.config.santralUrl);
    }

    // =========================================================
    // Core Helpers
    // =========================================================

    private normalizeBaseUrl(url: string): string {
        let value = (url ?? '').trim();

        if (!value) {
            return '';
        }

        const tagIndex = value.indexOf('?tag=');
        if (tagIndex >= 0) {
            value = value.substring(0, tagIndex);
        }

        const tagIndex2 = value.indexOf('&tag=');
        if (tagIndex2 >= 0) {
            value = value.substring(0, tagIndex2);
        }

        if (value.includes('index.php')) {
            return value;
        }

        value = value.replace(/\/+$/, '');

        return `${value}/index.php`;
    }

    private cleanValue(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value).trim();
    }

    private showGlobalLoading(): void {
        this.activeLoadingRequests++;

        if (this.activeLoadingRequests === 1) {
            this.loadingService.show();
        }
    }

    private hideGlobalLoading(): void {
        this.activeLoadingRequests--;

        if (this.activeLoadingRequests <= 0) {
            this.activeLoadingRequests = 0;
            this.loadingService.hide();
        }
    }

    private withLoading<T>(obs$: Observable<T>, showLoading = true): Observable<T> {
        if (!showLoading) {
            return obs$;
        }

        this.showGlobalLoading();

        return obs$.pipe(
            finalize(() => this.hideGlobalLoading())
        );
    }

    private buildParams(data?: Record<string, any>): HttpParams {
        let params = new HttpParams();

        if (!data) {
            return params;
        }

        Object.keys(data).forEach(key => {
            const value = data[key];

            if (value === null || value === undefined || value === '') {
                return;
            }

            if (Array.isArray(value)) {
                const joined = value
                    .map(x => this.cleanValue(x))
                    .filter(x => x !== '')
                    .join(',');

                if (joined !== '') {
                    params = params.set(key, joined);
                }

                return;
            }

            params = params.set(key, this.cleanValue(value));
        });

        return params;
    }

    private get<T = any>(
        tag: string,
        paramsData?: Record<string, any>,
        showLoading = true
    ): Observable<T> {

        const params = this.buildParams({
            tag,
            ...(paramsData ?? {})
        });

        const headers: HttpHeaders = this.headerService.headers;

        const request$ = this.client.get<T>(
            this.baseUrl,
            {
                headers,
                params
            }
        );

        return this.withLoading(request$, showLoading);
    }

    private getText(
        tag: string,
        paramsData?: Record<string, any>,
        showLoading = true
    ): Observable<string> {

        const params = this.buildParams({
            tag,
            ...(paramsData ?? {})
        });

        const request$ = this.client.get(
            this.baseUrl,
            {
                headers: this.headerService.headers,
                params,
                responseType: 'text'
            }
        );

        return this.withLoading(request$, showLoading);
    }

    private getBlob(
        tag: string,
        paramsData?: Record<string, any>,
        showLoading = true
    ): Observable<Blob> {

        const params = this.buildParams({
            tag,
            ...(paramsData ?? {})
        });

        const request$ = this.client.get(
            this.baseUrl,
            {
                headers: this.headerService.headers,
                params,
                responseType: 'blob'
            }
        );

        return this.withLoading(request$, showLoading);
    }

    private makeUrl(tag: string, paramsData?: Record<string, any>): string {
        const params = this.buildParams({
            tag,
            ...(paramsData ?? {})
        });

        return `${this.baseUrl}?${params.toString()}`;
    }

    // =========================================================
    // Caller ID
    // =========================================================

    CallerId(number: string, showLoading = true): Observable<string> {
        return this.getText('callerid', { number }, showLoading);
    }

    CallerIdByPhone(phone: string, showLoading = true): Observable<string> {
        return this.getText('callerid1', { phone }, showLoading);
    }

    // =========================================================
    // Users / Extensions
    // =========================================================

    GetUsers(SearchTarget: string = '', showLoading = true): Observable<any> {
        return this.get('getusers', { SearchTarget }, showLoading);
    }

    GetSantralDefinitions(
        extensions?: string | string[],
        showLoading = true
    ): Observable<SantralDefinitionsResponse> {

        const query: Record<string, any> = {};

        if (extensions) {
            query['extensions'] = Array.isArray(extensions)
                ? extensions.join(',')
                : extensions;
        }

        return this.get<SantralDefinitionsResponse>(
            'getSantralDefinitions',
            query,
            showLoading
        );
    }

    // =========================================================
    // Live Status
    // =========================================================

    GetExtensionsLiveStatus(
        extensions?: string | string[],
        showLoading = false
    ): Observable<SantralLiveStatusResponse> {

        const query: Record<string, any> = {};

        if (extensions) {
            query['extensions'] = Array.isArray(extensions)
                ? extensions.join(',')
                : extensions;
        }

        return this.get<SantralLiveStatusResponse>(
            'getExtensionsLiveStatus',
            query,
            showLoading
        );
    }

    GetAllExtensionsLiveStatus(showLoading = false): Observable<SantralLiveStatusResponse> {
        return this.get<SantralLiveStatusResponse>(
            'getExtensionsLiveStatus',
            {},
            showLoading
        );
    }

    // =========================================================
    // Separate Extension Health Monitor
    // =========================================================

    GetExtensionMonitorSnapshot(
        extensions?: string | string[],
        showLoading = false
    ): Observable<SantralExtensionMonitorSnapshotResponse> {
        const query: Record<string, any> = {};

        if (extensions) {
            query['extensions'] = Array.isArray(extensions)
                ? extensions.join(',')
                : extensions;
        }

        return this.get<SantralExtensionMonitorSnapshotResponse>(
            'getExtensionMonitorSnapshot',
            query,
            showLoading
        );
    }

    GetExtensionMonitorHistory(
        extension: string,
        startdate: string,
        enddate: string,
        limit = 200,
        showLoading = false
    ): Observable<SantralExtensionMonitorHistoryResponse> {
        return this.get<SantralExtensionMonitorHistoryResponse>(
            'getExtensionMonitorHistory',
            {
                extension,
                startdate,
                enddate,
                limit
            },
            showLoading
        );
    }


    GetExtensionMonitorReport(
        extension: string,
        startdate: string,
        enddate: string,
        limit = 500,
        showLoading = false
    ): Observable<SantralExtensionReportResponse> {
        return this.get<SantralExtensionReportResponse>(
            'getExtensionMonitorReport',
            {
                extension,
                startdate,
                enddate,
                limit
            },
            showLoading
        );
    }

    AcknowledgeExtensionMonitor(
        extension: string,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'acknowledgeExtensionMonitor',
            { extension },
            showLoading
        );
    }

    // =========================================================
    // CDR
    // =========================================================

    GetCdr(filter: SantralPagedFilter = {}, showLoading = false): Observable<any> {
        return this.get('getcdr', {
            page: filter.page ?? 1,
            limit: filter.limit ?? 50,
            sort: filter.sort ?? 'calldate',
            dir: filter.dir ?? 'DESC',
            startdate: filter.startdate,
            enddate: filter.enddate,
            SearchTarget: filter.SearchTarget,
            disposition: filter.disposition,
            extension: filter.extension,
            src: filter.src,
            dst: filter.dst,
            did: filter.did,
            CallType: filter.CallType,
            scanLimit: filter.scanLimit,
            chunkSize: filter.chunkSize
        }, showLoading);
    }

    GetCdrByUniqueId(uniqueid: string, showLoading = true): Observable<any> {
        return this.get('getCdrByUniqueId', { uniqueid }, showLoading);
    }

    // =========================================================
    // Dashboard
    // =========================================================

    GetDashboard(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getDashboard', {
            startdate: filter.startdate,
            enddate: filter.enddate,
            SearchTarget: filter.SearchTarget,
            disposition: filter.disposition,
            extension: filter.extension,
            src: filter.src,
            dst: filter.dst,
            did: filter.did,
            CallType: filter.CallType
        }, showLoading);
    }

    GetDashboardCalls(filter: SantralPagedFilter = {}, showLoading = false): Observable<any> {
        return this.get('getDashboardCalls', {
            startdate: filter.startdate,
            enddate: filter.enddate,
            disposition: filter.disposition,
            extension: filter.extension,
            scanLimit: filter.scanLimit ?? 20000,
            limit: filter.limit ?? 1000
        }, showLoading);
    }

    // =========================================================
    // Daily / Hourly Reports
    // =========================================================

    GetDailyCallCount(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getDailyCallCount', filter as Record<string, any>, showLoading);
    }

    GetDailyCallDetails(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getDailyCallDetails', filter as Record<string, any>, showLoading);
    }

    GetHourlyCallStats(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getHourlyCallStats', filter as Record<string, any>, showLoading);
    }

    GetDispositionStats(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getDispositionStats', filter as Record<string, any>, showLoading);
    }

    GetCallTypeStats(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getCallTypeStats', filter as Record<string, any>, showLoading);
    }

    // =========================================================
    // Top Reports
    // =========================================================

    GetTopCallers(
        filter: SantralBaseFilter & { limit?: number } = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getTopCallers', {
            ...filter,
            limit: filter.limit ?? 10
        }, showLoading);
    }

    GetTopReceivers(
        filter: SantralBaseFilter & { limit?: number } = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getTopReceivers', {
            ...filter,
            limit: filter.limit ?? 10
        }, showLoading);
    }

    GetAverageDuration(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getAverageDuration', filter as Record<string, any>, showLoading);
    }

    GetRepeatedCallers(
        filter: SantralBaseFilter & { min_count?: number; limit?: number } = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getRepeatedCallers', {
            ...filter,
            min_count: filter.min_count ?? 2,
            limit: filter.limit ?? 50
        }, showLoading);
    }

    // =========================================================
    // Extension Reports
    // =========================================================

    GetExtensionStats(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getExtensionStats', filter as Record<string, any>, showLoading);
    }

    GetExtensionDetails(
        extension: string,
        filter: SantralBaseFilter = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getExtensionDetails', {
            ...filter,
            extension
        }, showLoading);
    }

    // =========================================================
    // DID / Lines
    // =========================================================

    GetDidStats(filter: SantralBaseFilter = {}, showLoading = true): Observable<any> {
        return this.get('getDidStats', filter as Record<string, any>, showLoading);
    }

    // =========================================================
    // Missed Calls
    // =========================================================

    GetMissedCalls(filter: SantralPagedFilter = {}, showLoading = false): Observable<any> {
        return this.get('getMissedCalls', {
            page: filter.page ?? 1,
            limit: filter.limit ?? 50,
            startdate: filter.startdate,
            enddate: filter.enddate,
            SearchTarget: filter.SearchTarget,
            extension: filter.extension,
            src: filter.src,
            dst: filter.dst,
            did: filter.did,
            CallType: filter.CallType,
            scanLimit: filter.scanLimit,
            chunkSize: filter.chunkSize
        }, showLoading);
    }

    GetFollowupCalls(
        filter: SantralFollowupFilter = {},
        showLoading = false
    ): Observable<SantralFollowupResponse> {
        return this.get<SantralFollowupResponse>('getFollowupCalls', {
            startdate: filter.startdate,
            enddate: filter.enddate,
            extension: filter.extension,
            min_billsec: filter.min_billsec ?? 3,
            scanLimit: filter.scanLimit ?? 20000,
            limit: filter.limit ?? 500
        }, showLoading);
    }

    // =========================================================
    // Recordings
    // =========================================================

    GetRecordings(filter: SantralPagedFilter = {}, showLoading = true): Observable<any> {
        return this.get('getRecordings', {
            page: filter.page ?? 1,
            limit: filter.limit ?? 50,
            startdate: filter.startdate,
            enddate: filter.enddate,
            SearchTarget: filter.SearchTarget,
            disposition: filter.disposition,
            extension: filter.extension,
            src: filter.src,
            dst: filter.dst,
            did: filter.did,
            CallType: filter.CallType
        }, showLoading);
    }

    PlayRecording(file: string, showLoading = false): Observable<Blob> {
        return this.getBlob('playRecording', { file }, showLoading);
    }

    GetRecordingUrl(file: string): string {
        const cleanFile = this.cleanValue(file);

        if (!cleanFile) {
            return '';
        }

        return this.makeUrl('playRecording', { file: cleanFile });
    }

    CleanupRecordingCache(showLoading = true): Observable<any> {
        return this.get('cleanupRecordingCache', {}, showLoading);
    }

    // =========================================================
    // Long / Short Calls
    // =========================================================

    GetLongCalls(
        filter: SantralBaseFilter & { min_billsec?: number; limit?: number } = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getLongCalls', {
            ...filter,
            min_billsec: filter.min_billsec ?? 300,
            limit: filter.limit ?? 100
        }, showLoading);
    }

    GetShortCalls(
        filter: SantralBaseFilter & { max_billsec?: number; limit?: number } = {},
        showLoading = true
    ): Observable<any> {
        return this.get('getShortCalls', {
            ...filter,
            max_billsec: filter.max_billsec ?? 10,
            limit: filter.limit ?? 100
        }, showLoading);
    }

    // =========================================================
    // Debug / Test
    // =========================================================

    CheckAmiPort(showLoading = true): Observable<any> {
        return this.get('checkAmiPort', {}, showLoading);
    }

    CheckAmiLogin(showLoading = true): Observable<any> {
        return this.get('checkAmiLogin', {}, showLoading);
    }

    DebugLiveChannels(showLoading = true): Observable<any> {
        return this.get('debugLiveChannels', {}, showLoading);
    }

    DebugClientIp(showLoading = true): Observable<any> {
        return this.get('debugClientIp', {}, showLoading);
    }

    HangupExtensionCall(extension: string, showLoading = true): Observable<any> {
        return this.get('hangupExtensionCall', { extension }, showLoading);
    }

    HangupChannel(channel: string, showLoading = true): Observable<any> {
        return this.get('hangupChannel', { channel }, showLoading);
    }


    SpyExtensionCall(
        targetExtension: string,
        supervisorExtension: string,
        mode: SantralSpyMode = 'listen',
        showLoading = true
    ): Observable<SantralSpyResponse> {
        return this.get<SantralSpyResponse>('spyExtensionCall', {
            targetExtension,
            supervisorExtension,
            mode
        }, showLoading);
    }

    ListenExtensionCall(
        targetExtension: string,
        supervisorExtension: string,
        showLoading = true
    ): Observable<SantralSpyResponse> {
        return this.SpyExtensionCall(targetExtension, supervisorExtension, 'listen', showLoading);
    }

    WhisperExtensionCall(
        targetExtension: string,
        supervisorExtension: string,
        showLoading = true
    ): Observable<SantralSpyResponse> {
        return this.SpyExtensionCall(targetExtension, supervisorExtension, 'whisper', showLoading);
    }

    BargeExtensionCall(
        targetExtension: string,
        supervisorExtension: string,
        showLoading = true
    ): Observable<SantralSpyResponse> {
        return this.SpyExtensionCall(targetExtension, supervisorExtension, 'barge', showLoading);
    }
    GetSantralExtensionsForEdit(showLoading = true) {
        return this.get('getSantralExtensionsForEdit', {}, showLoading);
    }

    SaveSantralExtensionName(
        extension: string,
        displayName: string,
        showLoading = true
    ) {
        return this.get('saveSantralExtensionName', {
            extension,
            display_name: displayName
        }, showLoading);
    }

    GetCallerIdContacts(q: string = '', limit: number = 500, showLoading = true) {
        return this.get('getCallerIdContacts', {
            q,
            limit
        }, showLoading);
    }

    SaveCallerIdContactExact(
        id: string | number,
        number: string,
        name: string,
        explain: string,
        showLoading = true
    ) {
        return this.get('saveCallerIdContactExact', {
            id,
            number,
            name,
            explain
        }, showLoading);
    }
    SearchKowsarCentralForPhonebook(
        q: string,
        number: string = '',
        limit: number = 30,
        showLoading = true
    ) {
        return this.get('searchKowsarCentralForPhonebook', {
            q,
            number,
            limit
        }, showLoading);
    }

    BatchSearchKowsarPhonesForPhonebook(
        numbers: string[],
        maxPerNumber: number = 5,
        showLoading = true
    ) {
        return this.get('batchSearchKowsarPhonesForPhonebook', {
            numbers: (numbers || []).join(','),
            max_per_number: maxPerNumber
        }, showLoading);
    }

    GetUnknownCallerNumbers(startdate: string, enddate: string, limit: number = 500, showLoading = true) {
        return this.get('getUnknownCallerNumbers', {
            startdate,
            enddate,
            limit
        }, showLoading);
    }
    GetCallerNumberDetails(number: string, startdate: string, enddate: string, limit: number = 0, showLoading = true) {
        return this.get('getCallerNumberDetails', { number, startdate, enddate, limit }, showLoading);
    }

    SaveCallerNumberFollowUp(number: string, status: string, note: string, owner: string, showLoading = true) {
        return this.get('saveCallerNumberFollowUp', { number, status, note, owner }, showLoading);
    }

    DeleteCallerIdContact(id: string | number, showLoading = true) {
        return this.get('deleteCallerIdContact', {
            id
        }, showLoading);
    }

    GetExtensionForwardingStatus(extension: string, showLoading = true) {
        return this.get('getExtensionForwardingStatus', {
            extension
        }, showLoading);
    }

    SetExtensionForwarding(
        extension: string,
        mode: 'all' | 'busy' | 'unavailable',
        target: string,
        showLoading = true
    ) {
        return this.get('setExtensionForwarding', {
            extension,
            mode,
            target
        }, showLoading);
    }

    ClearExtensionForwarding(
        extension: string,
        mode: 'all' | 'busy' | 'unavailable',
        showLoading = true
    ) {
        return this.get('clearExtensionForwarding', {
            extension,
            mode
        }, showLoading);
    }



    GetOperatorRankingGroups(showLoading = true): Observable<any> {
        return this.get('getOperatorRankingGroups', {}, showLoading);
    }

    GetOperatorRankings(
        group: string,
        startdate: string = '',
        enddate: string = '',
        showLoading = true
    ): Observable<SantralOperatorRankingsResponse> {
        return this.get<SantralOperatorRankingsResponse>('getOperatorRankings', {
            group,
            startdate,
            enddate
        }, showLoading);
    }





    GetSantralRingGroupsDetails(showLoading = true): Observable<SantralRingGroupsDetailsResponse> {
        return this.get<SantralRingGroupsDetailsResponse>(
            'getSantralRingGroupsDetails',
            {},
            showLoading
        );
    }
    SaveSantralRingGroupBasic(
        grpnum: string,
        description: string,
        strategy: string,
        grptime: number,
        create = false,
        showLoading = true
    ): Observable<any> {
        return this.get('saveSantralRingGroupBasic', {
            grpnum,
            description,
            strategy,
            grptime,
            create: create ? 1 : 0
        }, showLoading);
    }
    SaveSantralRingGroupMembers(
        grpnum: string,
        members: string,
        showLoading = true
    ): Observable<any> {
        return this.get('saveSantralRingGroupMembers', {
            grpnum,
            members
        }, showLoading);
    }
    ApplySantralConfig(showLoading = true): Observable<any> {
        return this.get('applySantralConfig', {}, showLoading);
    }
    SaveSantralRingGroupPostDest(
        grpnum: string,
        destType: 'extension' | 'ringgroup' | 'ivr',
        destValue: string,
        showLoading = true
    ): Observable<any> {
        return this.get('saveSantralRingGroupPostDest', {
            grpnum,
            dest_type: destType,
            dest_value: destValue
        }, showLoading);
    }


    GetSantralBlacklist(showLoading = true): Observable<SantralBlacklistResponse> {
        return this.get<SantralBlacklistResponse>(
            'getSantralBlacklist',
            {},
            showLoading
        );
    }

    AddSantralBlacklist(
        number: string,
        showLoading = true
    ): Observable<any> {
        return this.get(
            'addSantralBlacklist',
            {
                number
            },
            showLoading
        );
    }

    DeleteSantralBlacklist(
        number: string,
        showLoading = true
    ): Observable<any> {
        return this.get(
            'deleteSantralBlacklist',
            {
                number
            },
            showLoading
        );
    }



    GetSantralCallRecordingSettings(showLoading = true): Observable<SantralCallRecordingResponse> {
        return this.get<SantralCallRecordingResponse>(
            'getSantralCallRecordingSettings',
            {},
            showLoading
        );
    }

    SaveSantralCallRecordingFields(
        extension: string,
        data: SantralCallRecordingSaveRequest,
        showLoading = true
    ): Observable<any> {
        return this.get(
            'saveSantralCallRecordingFields',
            {
                extension,
                in_external: data.in_external,
                in_internal: data.in_internal,
                out_external: data.out_external,
                out_internal: data.out_internal
            },
            showLoading
        );
    }

    SantralClickToCall(
        caller: string | number,
        target: string | number,
        showLoading: boolean = true
    ): Observable<any> {
        return this.get('santralClickToCall', {
            caller,
            target
        }, showLoading);
    }



    GetPhoneBook(extension: string, showLoading = false): Observable<any> {
        return this.get('getPhoneBook', { extension }, showLoading);
    }

    SaveWebPhoneFavorite(extension: string, cidId: number, showLoading = false): Observable<any> {
        return this.get('saveWebPhoneFavorite', { extension, cidId }, showLoading);
    }

    DeleteWebPhoneFavorite(extension: string, favoriteId: number, showLoading = false): Observable<any> {
        return this.get('deleteWebPhoneFavorite', { extension, favoriteId }, showLoading);
    }
    SantralVoicemail_Save(
        extension: string,
        enabled: boolean,
        password: string = '',
        ringtimer: number = 20,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'saveSantralVoicemailSettings',
            {
                extension,
                enabled: enabled ? 1 : 0,
                password,
                ringtimer
            },
            showLoading
        );
    }

    SantralVoicemail_Check(
        extension: string,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'checkSantralVoicemailStatus',
            { extension },
            showLoading
        );
    }
    GetSantralVoicemailMessages(
        extension: string,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'getSantralVoicemailMessages',
            { extension },
            showLoading
        );
    }
    SantralVoicemail_PlayUrl(
        extension: string,
        folder: string,
        messageNo: string,
        context: string = 'default'
    ): string {
        const params = new URLSearchParams({
            tag: 'playSantralVoicemailMessage',
            extension,
            context,
            folder,
            message_no: messageNo
        });

        return `${this.baseUrl}?${params.toString()}`;
    }
    SantralVoicemail_Delete(
        extension: string,
        folder: string,
        messageNo: string,
        context: string = 'default',
        showLoading = false
    ): Observable<any> {
        return this.get(
            'deleteSantralVoicemailMessage',
            {
                extension,
                context,
                folder,
                message_no: messageNo
            },
            showLoading
        );
    }

    SantralVoicemail_MoveToOld(
        extension: string,
        folder: string,
        messageNo: string,
        context: string = 'default',
        showLoading = false
    ): Observable<any> {
        return this.get(
            'moveSantralVoicemailMessageToOld',
            {
                extension,
                context,
                folder,
                message_no: messageNo
            },
            showLoading
        );
    }
    GetSantralExtensionCallRules(
        extension: string,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'getSantralExtensionCallRules',
            { extension },
            showLoading
        );
    }

    SaveSantralExtensionCallRules(
        extension: string,
        allowInternal: boolean,
        allowOutbound: boolean,
        allowExternalInbound: boolean,
        showLoading = false
    ): Observable<any> {
        return this.get(
            'saveSantralExtensionCallRules',
            {
                extension,
                allow_internal: allowInternal ? 1 : 0,
                allow_outbound: allowOutbound ? 1 : 0,
                allow_external_inbound: allowExternalInbound ? 1 : 0
            },
            showLoading
        );
    }
    StartSantralConference(
        extension: string,
        target: string,
        room: string = '',
        showLoading = false
    ): Observable<any> {
        return this.get(
            'startSantralConference',
            {
                extension,
                target,
                room
            },
            showLoading
        );
    }

}