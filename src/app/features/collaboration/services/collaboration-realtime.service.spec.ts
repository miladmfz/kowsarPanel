import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as signalR from '@microsoft/signalr';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { CollaborationRealtimeService } from './collaboration-realtime.service';

describe('CollaborationRealtimeService', () => {
  let connectionState: signalR.HubConnectionState;
  let connection: jasmine.SpyObj<signalR.HubConnection>;

  beforeEach(() => {
    connectionState = signalR.HubConnectionState.Disconnected;
    connection = jasmine.createSpyObj<signalR.HubConnection>(
      'HubConnection',
      ['start', 'stop', 'invoke', 'on', 'onreconnecting', 'onreconnected', 'onclose']
    );
    Object.defineProperty(connection, 'state', { get: () => connectionState });
    connection.start.and.callFake(async () => { connectionState = signalR.HubConnectionState.Connected; });
    connection.stop.and.resolveTo();
    connection.invoke.and.resolveTo();
    spyOn(signalR.HubConnectionBuilder.prototype, 'build').and.returnValue(connection);

    const config = new AppConfigService();
    config.initialize({ appVersion: '1', production: false, apiUrl: 'https://api.test/api/', baseHref: '/' });
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(),
      CollaborationRealtimeService,
      { provide: AppConfigService, useValue: config },
      { provide: SessionStorageService, useValue: { accessToken: 'test-access-token' } }
    ] });
  });

  it('connects to the collaboration hub and joins the selected room', async () => {
    const service = TestBed.inject(CollaborationRealtimeService);

    await service.openRoom(42);

    expect(connection.start).toHaveBeenCalledTimes(1);
    expect(connection.invoke).toHaveBeenCalledWith('JoinRoom', 42);
  });

  it('retries an initially failed connection without requiring a page refresh', async () => {
    jasmine.clock().install();
    let attempts = 0;
    connection.start.and.callFake(() => {
      attempts += 1;
      if (attempts === 1) return Promise.reject(new Error('initial connection failed'));
      connectionState = signalR.HubConnectionState.Connected;
      return Promise.resolve();
    });
    const service = TestBed.inject(CollaborationRealtimeService);

    try {
      await service.openRoom(17).catch(() => undefined);
      expect(connection.start).toHaveBeenCalledTimes(1);

      jasmine.clock().tick(5000);
      for (let index = 0; index < 6; index += 1) await Promise.resolve();

      expect(connection.start).toHaveBeenCalledTimes(2);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('restores the selected room after SignalR reconnects', async () => {
    const service = TestBed.inject(CollaborationRealtimeService);
    await service.openRoom(9);
    connection.invoke.calls.reset();

    const reconnected = connection.onreconnected.calls.mostRecent().args[0];
    await reconnected('replacement-connection');

    expect(connection.invoke).toHaveBeenCalledWith('JoinRoom', 9);
  });
});
