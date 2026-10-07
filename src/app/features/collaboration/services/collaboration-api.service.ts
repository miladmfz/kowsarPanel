import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import {
  CollaborationBookmark,
  CollaborationGroup,
  CollaborationIntegration,
  CollaborationNotification,
  CollaborationPlaybook,
  CollaborationPost,
  CollaborationRoom,
  CollaborationRun,
  CollaborationSearchResult,
  CollaborationUser,
  CreatePostCommand,
  CreateRoomCommand
} from '../models/collaboration.models';

@Injectable({ providedIn: 'root' })
export class CollaborationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(AppConfigService).apiUrl}Collaboration/`;

  getRooms(): Observable<CollaborationRoom[]> {
    return this.http.get<CollaborationRoom[]>(`${this.baseUrl}rooms`);
  }

  getUsers(query?: string): Observable<CollaborationUser[]> {
    const params = query?.trim() ? new HttpParams().set('query', query.trim()) : undefined;
    return this.http.get<CollaborationUser[]>(`${this.baseUrl}users`, { params });
  }

  startDirect(departmentUserCode: number): Observable<{ roomCode: number }> {
    return this.http.post<{ roomCode: number }>(`${this.baseUrl}direct`, { departmentUserCode });
  }

  createRoom(command: CreateRoomCommand): Observable<{ roomCode: number }> {
    return this.http.post<{ roomCode: number }>(`${this.baseUrl}rooms`, command);
  }

  getPosts(roomCode: number, rootPostRef?: number): Observable<CollaborationPost[]> {
    let params = new HttpParams().set('take', 200);
    if (rootPostRef) params = params.set('rootPostRef', rootPostRef);
    return this.http.get<CollaborationPost[]>(`${this.baseUrl}rooms/${roomCode}/posts`, { params });
  }

  createPost(roomCode: number, command: CreatePostCommand): Observable<{ postCode: number }> {
    return this.http.post<{ postCode: number }>(`${this.baseUrl}rooms/${roomCode}/posts`, command);
  }

  markRead(roomCode: number, lastReadPostRef?: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}rooms/${roomCode}/read`, { lastReadPostRef: lastReadPostRef ?? null });
  }

  getNotifications(take = 30): Observable<CollaborationNotification[]> {
    return this.http.get<CollaborationNotification[]>(`${this.baseUrl}notifications`, {
      params: new HttpParams().set('take', take)
    });
  }

  readNotification(notificationCode: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}notifications/${notificationCode}/read`, {});
  }

  readAllNotifications(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}notifications/read-all`, {});
  }

  acknowledge(postCode: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}posts/${postCode}/acknowledge`, {});
  }

  follow(postCode: number, follow: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}posts/${postCode}/follow`, { follow });
  }

  mute(roomCode: number, muted: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}rooms/${roomCode}/mute`, { muted });
  }

  addMember(roomCode: number, command: { subject: string; personInfoRef?: number; memberRole: 'Owner' | 'Moderator' | 'Member' }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}rooms/${roomCode}/members`, command);
  }

  getBookmarks(roomCode: number): Observable<CollaborationBookmark[]> {
    return this.http.get<CollaborationBookmark[]>(`${this.baseUrl}rooms/${roomCode}/bookmarks`);
  }

  addBookmark(roomCode: number, command: { postRef?: number; title: string; url?: string; sortOrder?: number }): Observable<{ bookmarkCode: number }> {
    return this.http.post<{ bookmarkCode: number }>(`${this.baseUrl}rooms/${roomCode}/bookmarks`, command);
  }

  addReminder(postCode: number, remindAt: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}posts/${postCode}/reminders`, { remindAt });
  }

  search(query: string, roomRef?: number, filters?: { author?: string; dateFrom?: string; dateTo?: string; hasAttachment?: boolean }): Observable<CollaborationSearchResult[]> {
    let params = new HttpParams().set('query', query);
    if (roomRef) params = params.set('roomRef', roomRef);
    if (filters?.author) params = params.set('author', filters.author);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.hasAttachment !== undefined) params = params.set('hasAttachment', filters.hasAttachment);
    return this.http.get<CollaborationSearchResult[]>(`${this.baseUrl}search`, { params });
  }

  uploadAttachment(postCode: number, file: File): Observable<{ attachmentCode: number }> {
    const form = new FormData(); form.append('file', file, file.name);
    return this.http.post<{ attachmentCode: number }>(`${this.baseUrl}posts/${postCode}/attachments`, form);
  }

  attachmentUrl(attachmentCode: number): string {
    return `${this.baseUrl}attachments/${attachmentCode}`;
  }

  downloadAttachment(attachmentCode: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}attachments/${attachmentCode}`, { responseType: 'blob' });
  }

  executeAction(postCode: number, actionCode: number): Observable<{ result: string | null }> {
    return this.http.post<{ result: string | null }>(`${this.baseUrl}posts/${postCode}/actions/${actionCode}/execute`, {
      idempotencyKey: this.createIdempotencyKey()
    });
  }

  private createIdempotencyKey(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }

    // Private HTTP profiles may not expose crypto.randomUUID. This value only
    // deduplicates an action; authentication still comes from the JWT.
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  getPlaybooks(): Observable<CollaborationPlaybook[]> {
    return this.http.get<CollaborationPlaybook[]>(`${this.baseUrl}playbooks`);
  }

  createPlaybook(command: { title: string; description?: string; steps: Array<{ title: string; defaultAssigneeSubject?: string }> }): Observable<{ playbookCode: number }> {
    return this.http.post<{ playbookCode: number }>(`${this.baseUrl}playbooks`, command);
  }

  startRun(playbookCode: number, command: { title: string; linkedEntityType?: string; linkedEntityCode?: string }): Observable<{ runCode: number }> {
    return this.http.post<{ runCode: number }>(`${this.baseUrl}playbooks/${playbookCode}/runs`, command);
  }

  getRuns(): Observable<CollaborationRun[]> {
    return this.http.get<CollaborationRun[]>(`${this.baseUrl}runs`);
  }

  updateRunStep(runCode: number, stepCode: number, status: CollaborationRun['steps'][number]['status']): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}runs/${runCode}/steps/${stepCode}`, { status, assigneeSubject: null });
  }

  getGroups(): Observable<CollaborationGroup[]> {
    return this.http.get<CollaborationGroup[]>(`${this.baseUrl}groups`);
  }

  createGroup(command: { groupKey: string; title: string; memberSubjects: string[] }): Observable<{ groupCode: number }> {
    return this.http.post<{ groupCode: number }>(`${this.baseUrl}groups`, command);
  }

  getIntegrations(): Observable<CollaborationIntegration[]> {
    return this.http.get<CollaborationIntegration[]>(`${this.baseUrl}integrations`);
  }

  createIntegration(command: { title: string; eventPattern: string; targetRoomRef: number; webhookUrl?: string }): Observable<{ integrationCode: number }> {
    return this.http.post<{ integrationCode: number }>(`${this.baseUrl}integrations`, command);
  }
}
