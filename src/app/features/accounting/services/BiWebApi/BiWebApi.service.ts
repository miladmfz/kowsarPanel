import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';
import {
  BiAdminCatalog,
  BiAdminDataset,
  BiAdminField,
  BiAdminMetric,
  BiCatalog,
  BiDashboard,
  BiDashboardWriteRequest,
  BiDatasetUpdateRequest,
  BiFieldUpdateRequest,
  BiMetricUpdateRequest,
  BiManagementPack,
  BiQueryRequest,
  BiQueryResponse,
  BiAuditEvent,
  BiBookmark,
  BiBookmarkState,
  BiDashboardShare,
  BiDashboardVersion,
  BiShareTarget,
  BiAlertEvent,
  BiAsyncJob,
  BiCleanupResult,
  BiOperationsHealth,
  BiPilotParticipantConfiguration,
  BiPilotParticipantWriteRequest,
  BiPilotReadiness,
  BiPilotReview,
  BiPilotReviewWriteRequest,
  BiSchedule,
  BiScheduleWriteRequest,
  BiSnapshot,
  BiAnalyticsRequest,
  BiAnalyticsResponse,
  BiNaturalLanguageRequest,
  BiNaturalLanguageResponse,
} from './bi.models';

@Injectable({ providedIn: 'root' })
export class BiWebApiService {
  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly headers = inject(HeaderService);
  private readonly baseUrl = `${this.config.apiUrl}bi/`;

  getCatalog(): Observable<BiCatalog> {
    return this.client.get<BiCatalog>(`${this.baseUrl}catalog`, { headers: this.headers.headers });
  }

  query(request: BiQueryRequest): Observable<BiQueryResponse> {
    return this.client.post<BiQueryResponse>(`${this.baseUrl}query`, request, { headers: this.headers.headers });
  }

  analyze(request: BiAnalyticsRequest): Observable<BiAnalyticsResponse> {
    return this.client.post<BiAnalyticsResponse>(`${this.baseUrl}analytics/analyze`, request, { headers: this.headers.headers });
  }

  interpret(request: BiNaturalLanguageRequest): Observable<BiNaturalLanguageResponse> {
    return this.client.post<BiNaturalLanguageResponse>(`${this.baseUrl}analytics/interpret`, request, { headers: this.headers.headers });
  }

  getDashboards(): Observable<BiDashboard[]> {
    return this.client.get<BiDashboard[]>(`${this.baseUrl}dashboards`, { headers: this.headers.headers });
  }

  getDashboard(dashboardCode: number): Observable<BiDashboard> {
    return this.client.get<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}`, { headers: this.headers.headers });
  }

  createDashboard(request: BiDashboardWriteRequest): Observable<BiDashboard> {
    return this.client.post<BiDashboard>(`${this.baseUrl}dashboards`, request, { headers: this.headers.headers });
  }

  updateDashboard(dashboardCode: number, request: BiDashboardWriteRequest): Observable<BiDashboard> {
    return this.client.put<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}`, request, { headers: this.headers.headers });
  }

  deleteDashboard(dashboardCode: number): Observable<void> {
    return this.client.delete<void>(`${this.baseUrl}dashboards/${dashboardCode}`, { headers: this.headers.headers });
  }

  copyDashboard(dashboardCode: number): Observable<BiDashboard> {
    return this.client.post<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}/copy`, {}, { headers: this.headers.headers });
  }

  setFavorite(dashboardCode: number, isFavorite: boolean): Observable<BiDashboard> {
    return this.client.patch<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}/favorite`, { isFavorite }, { headers: this.headers.headers });
  }

  setDefault(dashboardCode: number, isDefault: boolean): Observable<void> {
    return this.client.patch<void>(`${this.baseUrl}dashboards/${dashboardCode}/default`, { isDefault }, { headers: this.headers.headers });
  }

  getShareTargets(): Observable<BiShareTarget[]> {
    return this.client.get<BiShareTarget[]>(`${this.baseUrl}share-targets`, { headers: this.headers.headers });
  }

  getShares(dashboardCode: number): Observable<BiDashboardShare[]> {
    return this.client.get<BiDashboardShare[]>(`${this.baseUrl}dashboards/${dashboardCode}/shares`, { headers: this.headers.headers });
  }

  saveShare(dashboardCode: number, request: { targetType: 'User' | 'Role'; targetKey: string; accessLevel: 'View' | 'Copy' | 'Edit'; isDefault: boolean; priority: number }): Observable<BiDashboardShare> {
    return this.client.put<BiDashboardShare>(`${this.baseUrl}dashboards/${dashboardCode}/shares`, request, { headers: this.headers.headers });
  }

  deleteShare(dashboardCode: number, shareCode: number): Observable<void> {
    return this.client.delete<void>(`${this.baseUrl}dashboards/${dashboardCode}/shares/${shareCode}`, { headers: this.headers.headers });
  }

  publish(dashboardCode: number, request: { isTemplate: boolean; templateDescription?: string; changeNote?: string }): Observable<BiDashboard> {
    return this.client.post<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}/publish`, request, { headers: this.headers.headers });
  }

  getVersions(dashboardCode: number): Observable<BiDashboardVersion[]> {
    return this.client.get<BiDashboardVersion[]>(`${this.baseUrl}dashboards/${dashboardCode}/versions`, { headers: this.headers.headers });
  }

  rollback(dashboardCode: number, versionNumber: number, changeNote?: string): Observable<BiDashboard> {
    return this.client.post<BiDashboard>(`${this.baseUrl}dashboards/${dashboardCode}/rollback`, { versionNumber, changeNote }, { headers: this.headers.headers });
  }

  getBookmarks(dashboardCode: number): Observable<BiBookmark[]> {
    return this.client.get<BiBookmark[]>(`${this.baseUrl}dashboards/${dashboardCode}/bookmarks`, { headers: this.headers.headers });
  }

  createBookmark(dashboardCode: number, title: string, state: BiBookmarkState): Observable<BiBookmark> {
    return this.client.post<BiBookmark>(`${this.baseUrl}dashboards/${dashboardCode}/bookmarks`, { title, state }, { headers: this.headers.headers });
  }

  deleteBookmark(dashboardCode: number, bookmarkCode: number): Observable<void> {
    return this.client.delete<void>(`${this.baseUrl}dashboards/${dashboardCode}/bookmarks/${bookmarkCode}`, { headers: this.headers.headers });
  }

  getAudit(take = 100): Observable<BiAuditEvent[]> {
    return this.client.get<BiAuditEvent[]>(`${this.baseUrl}audit`, { headers: this.headers.headers, params: { take } });
  }

  getManagementPacks(): Observable<BiManagementPack[]> {
    return this.client.get<BiManagementPack[]>(`${this.baseUrl}packs`, { headers: this.headers.headers });
  }

  installManagementPack(packKey: string): Observable<BiDashboard> {
    return this.client.post<BiDashboard>(`${this.baseUrl}packs/${encodeURIComponent(packKey)}/install`, {}, { headers: this.headers.headers });
  }

  getAdminCatalog(): Observable<BiAdminCatalog> {
    return this.client.get<BiAdminCatalog>(`${this.baseUrl}admin/catalog`, { headers: this.headers.headers });
  }

  updateDataset(datasetKey: string, request: BiDatasetUpdateRequest): Observable<BiAdminDataset> {
    return this.client.put<BiAdminDataset>(`${this.baseUrl}admin/datasets/${encodeURIComponent(datasetKey)}`, request, { headers: this.headers.headers });
  }

  updateField(datasetKey: string, fieldKey: string, request: BiFieldUpdateRequest): Observable<BiAdminField> {
    return this.client.put<BiAdminField>(
      `${this.baseUrl}admin/datasets/${encodeURIComponent(datasetKey)}/fields/${encodeURIComponent(fieldKey)}`,
      request,
      { headers: this.headers.headers },
    );
  }

  updateMetric(metricKey: string, request: BiMetricUpdateRequest): Observable<BiAdminMetric> {
    return this.client.put<BiAdminMetric>(`${this.baseUrl}admin/metrics/${encodeURIComponent(metricKey)}`, request, { headers: this.headers.headers });
  }

  getOperationsHealth(days = 7): Observable<BiOperationsHealth> {
    return this.client.get<BiOperationsHealth>(`${this.baseUrl}operations/health`, { headers: this.headers.headers, params: { days } });
  }

  getPilotReadiness(datasetKey = 'sales.summary', days = 90, targetQueries = 100): Observable<BiPilotReadiness> {
    return this.client.get<BiPilotReadiness>(`${this.baseUrl}operations/pilot/readiness`, {
      headers: this.headers.headers, params: { datasetKey, days, targetQueries },
    });
  }

  savePilotReview(request: BiPilotReviewWriteRequest): Observable<BiPilotReview> {
    return this.client.put<BiPilotReview>(`${this.baseUrl}operations/pilot/review`, request, { headers: this.headers.headers });
  }

  getPilotParticipants(datasetKey = 'sales.summary'): Observable<BiPilotParticipantConfiguration> {
    return this.client.get<BiPilotParticipantConfiguration>(`${this.baseUrl}operations/pilot/participants`, {
      headers: this.headers.headers, params: { datasetKey },
    });
  }

  savePilotParticipants(request: BiPilotParticipantWriteRequest): Observable<BiPilotParticipantConfiguration> {
    return this.client.put<BiPilotParticipantConfiguration>(`${this.baseUrl}operations/pilot/participants`, request, { headers: this.headers.headers });
  }

  createAsyncJob(type: 'query' | 'export', query: BiQueryRequest): Observable<BiAsyncJob> {
    return this.client.post<BiAsyncJob>(`${this.baseUrl}operations/jobs/${type}`, { query }, { headers: this.headers.headers });
  }

  getAsyncJobs(): Observable<BiAsyncJob[]> {
    return this.client.get<BiAsyncJob[]>(`${this.baseUrl}operations/jobs`, { headers: this.headers.headers });
  }

  getAsyncJobResult(jobCode: number): Observable<Blob> {
    return this.client.get(`${this.baseUrl}operations/jobs/${jobCode}/result`, { headers: this.headers.headers, responseType: 'blob' });
  }

  cancelAsyncJob(jobCode: number): Observable<void> {
    return this.client.delete<void>(`${this.baseUrl}operations/jobs/${jobCode}`, { headers: this.headers.headers });
  }

  getSchedules(): Observable<BiSchedule[]> {
    return this.client.get<BiSchedule[]>(`${this.baseUrl}operations/schedules`, { headers: this.headers.headers });
  }

  createSchedule(request: BiScheduleWriteRequest): Observable<BiSchedule> {
    return this.client.post<BiSchedule>(`${this.baseUrl}operations/schedules`, request, { headers: this.headers.headers });
  }

  runSchedule(scheduleCode: number): Observable<void> {
    return this.client.post<void>(`${this.baseUrl}operations/schedules/${scheduleCode}/run`, {}, { headers: this.headers.headers });
  }

  deleteSchedule(scheduleCode: number): Observable<void> {
    return this.client.delete<void>(`${this.baseUrl}operations/schedules/${scheduleCode}`, { headers: this.headers.headers });
  }

  getSnapshots(): Observable<BiSnapshot[]> {
    return this.client.get<BiSnapshot[]>(`${this.baseUrl}operations/snapshots`, { headers: this.headers.headers });
  }

  getAlerts(): Observable<BiAlertEvent[]> {
    return this.client.get<BiAlertEvent[]>(`${this.baseUrl}operations/alerts`, { headers: this.headers.headers });
  }

  cleanupBiRetention(): Observable<BiCleanupResult> {
    return this.client.post<BiCleanupResult>(`${this.baseUrl}operations/retention/cleanup`, {}, { headers: this.headers.headers });
  }
}
