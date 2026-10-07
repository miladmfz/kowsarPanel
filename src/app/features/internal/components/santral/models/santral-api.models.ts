export type SantralCallType =
    | 'Incoming'
    | 'Outgoing'
    | 'Internal'
    | 'IVR'
    | 'RingGroup'
    | 'Transfer'
    | 'Other';

export type SantralDirectionCallType =
    | 'Incoming'
    | 'Outgoing'
    | 'Internal';

export type SantralRouteType =
    | 'Direct'
    | 'RingGroup'
    | 'Forward'
    | 'Transfer'
    | 'IVR';

export interface SantralLogicalCallRow {
    id: string;
    call_key: string;
    logical_call_key: string;
    linkedid: string;
    calldate: string;
    calldate_fa: string;
    src: string;
    dst: string;
    extension: string;
    call_type: SantralDirectionCallType;
    call_type_fa: string;
    route_type: SantralRouteType;
    route_type_fa: string;
    route_from: string;
    route_to: string;
    route_display: string;
    forwarded_from: string;
    transferred_from: string;
    peer_number: string;
    peer_display: string;
    disposition: SantralDisposition | string;
    disposition_fa: string;
    duration: number;
    duration_fa: string;
    billsec: number;
    billsec_fa: string;
    did: string;
    legs_count: number;
    is_ringgroup: number;
    ringgroup_number: string;
    ringgroup_name: string;
    answered_extension: string;
    recordingfile: string;
    recording_url: string;
    has_recording: number;
}

export interface SantralCallReportSummary {
    total_calls: number;
    answered_calls: number;
    no_answer_calls: number;
    busy_calls: number;
    failed_calls: number;
    recorded_calls: number;
    total_duration: number;
    total_billsec: number;
    avg_duration: number;
    avg_billsec: number;
    answer_rate: number;
    total_duration_fa?: string;
    total_billsec_fa?: string;
    avg_duration_fa?: string;
    avg_billsec_fa?: string;
}

export interface SantralCallReportFacet {
    call_count: number;
    answered_calls?: number;
    total_billsec?: number;
    call_type?: string;
    call_type_fa?: string;
    route_type?: string;
    route_type_fa?: string;
    disposition?: string;
    disposition_fa?: string;
    line_number?: string;
}

export interface SantralCallReportResponse {
    ErrCode: number;
    ErrDesc: string;
    records: SantralLogicalCallRow[];
    cdr: SantralLogicalCallRow[];
    summary: SantralCallReportSummary;
    facets: {
        call_types: SantralCallReportFacet[];
        route_types: SantralCallReportFacet[];
        dispositions: SantralCallReportFacet[];
        did_stats: SantralCallReportFacet[];
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: number;
        has_previous: number;
    };
    quality: {
        logical_total: number;
        raw_rows_scanned: number;
        scan_limit: number;
        scan_truncated: number;
        count_mode: string;
        engine: string;
    };
    filters: Record<string, string>;
}

export interface SantralLogicalCallTraceResponse {
    ErrCode: number;
    ErrDesc: string;
    call_key: string;
    extension: string;
    logical_views: SantralLogicalCallRow[];
    raw_legs: any[];
    cel_events?: any[];
    legs_count: number;
    cel_events_count?: number;
    count_mode: string;
}

export type SantralDisposition =
    | 'ANSWERED'
    | 'NO ANSWER'
    | 'BUSY'
    | 'FAILED'
    | 'CONGESTION';

export type SantralSpyMode = 'listen' | 'whisper' | 'barge';

export type SantralFollowupDirection = 'incoming' | 'outgoing';

export interface SantralFollowupAttempt {
    logical_call_key: string;
    calldate: string;
    calldate_fa: string;
    direction: SantralFollowupDirection;
    direction_fa: string;
    number: string;
    peer_display: string;
    disposition: SantralDisposition | 'SHORT ANSWER' | string;
    disposition_fa: string;
    duration: number;
    duration_fa: string;
    billsec: number;
    billsec_fa: string;
    did: string;
    src: string;
    dst: string;
    legs_count: number;
    is_ringgroup?: number;
    ringgroup_number?: string;
    ringgroup_name?: string;
    ringgroup_members?: string[];
    answered_extension?: string;
}

export interface SantralFollowupItem {
    number: string;
    external_number: string;
    normalized_number: string;
    contact_name: string;
    display_name: string;
    direction: SantralFollowupDirection;
    direction_fa: string;
    attempt_count: number;
    first_attempt: string;
    first_attempt_fa: string;
    last_attempt: string;
    last_attempt_fa: string;
    last_disposition: SantralDisposition | 'SHORT ANSWER' | string;
    last_disposition_fa: string;
    last_success: string;
    last_success_fa: string;
    followup_status: 'OPEN' | string;
    followup_status_fa: string;
    did: string;
    logical_call_key: string;
    is_ringgroup?: number;
    ringgroup_number?: string;
    ringgroup_name?: string;
    ringgroup_members?: string[];
    attempts: SantralFollowupAttempt[];
}

export interface SantralFollowupFilter {
    startdate?: string;
    enddate?: string;
    extension?: string;
    min_billsec?: number;
    scanLimit?: number;
    limit?: number;
}

export interface SantralFollowupResponse {
    ErrCode: number;
    ErrDesc: string;
    extension: string;
    startdate: string;
    enddate: string;
    min_billsec: number;
    incoming: SantralFollowupItem[];
    outgoing: SantralFollowupItem[];
    incoming_total: number;
    outgoing_total: number;
    total: number;
    logical_calls_scanned: number;
    seed_rows: number;
    scan_limit: number;
    scan_truncated: number;
    count_mode: string;
    ringgroup_excluded: number;
    ringgroup_included?: number;
    ringgroups?: Array<{
        grpnum: string;
        description?: string;
        grplist?: string;
        members?: string[];
        strategy?: string;
        grptime?: number;
    }>;
}
export interface SantralOperatorRankingGroup {
    grpnum: string;
    description: string;
    strategy: string;
    grptime: number;
    grplist: string;
    postdest: string;
}
export type SantralRecordingMode = 'always' | 'never' | 'dontcare';

export interface SantralRecordingInfo {
    in_external: SantralRecordingMode | string;
    in_internal: SantralRecordingMode | string;
    out_external: SantralRecordingMode | string;
    out_internal: SantralRecordingMode | string;
    ondemand: string;
    priority: string;
}

export interface SantralCallRecordingItem {
    extension: string;
    name: string;
    recording: SantralRecordingInfo;
}

export interface SantralCallRecordingResponse {
    ErrCode: number;
    ErrDesc: string;
    total: number;
    items: SantralCallRecordingItem[];
}

export interface SantralCallRecordingSaveRequest {
    in_external: SantralRecordingMode;
    in_internal: SantralRecordingMode;
    out_external: SantralRecordingMode;
    out_internal: SantralRecordingMode;
}
export interface SantralOperatorRankingItem {
    rank: number;
    extension: string;
    name: string;

    total_calls: number;
    answered_calls: number;
    missed_calls: number;

    answer_rate: number;

    total_talk_sec: number;
    avg_talk_sec: number;

    answered_relative_score: number;
    avg_talk_relative_score: number;

    score: number;
}
export interface SantralRingGroupMember {
    extension: string;
    name: string;
}

export interface SantralRingGroupDetails {
    grpnum: string;
    description: string;
    description_fa: string;
    strategy: string;
    strategy_fa: string;
    grptime: number;
    grptime_text: string;
    grplist: string;
    postdest: string;
    members_count: number;
    members: SantralRingGroupMember[];
}

export interface SantralBlacklistItem {
    number: string;
    value: string;
}

export interface SantralBlacklistResponse {
    ErrCode: number;
    ErrDesc: string;
    total: number;
    items: SantralBlacklistItem[];
}
export interface SantralRingGroupsDetailsResponse {
    ErrCode: number;
    ErrDesc: string;
    total: number;
    groups: SantralRingGroupDetails[];
}
export interface SantralOperatorRankingsResponse {
    ErrCode: number;
    ErrDesc: string;

    startdate: string;
    enddate: string;

    group: {
        grpnum: string;
        description: string;
        strategy: string;
        grptime: number;
        grplist: string;
        postdest: string;
        members_count: number;
    };

    formula: {
        answer_rate_weight: number;
        answered_relative_weight: number;
        avg_talk_relative_weight: number;
    };

    operators: SantralOperatorRankingItem[];
}
export interface SantralSpyResponse {
    ErrCode: number;
    ErrDesc: string;
    mode: SantralSpyMode;
    mode_fa: string;
    supervisorExtension: string;
    targetExtension: string;
    supervisorChannel: string;
    supervisorChannelMode?: string;
    spyTarget: string;
    chanSpyOptions: string;
    call_state?: any;
    ami_result?: any;
}
export interface SantralBaseFilter {
    startdate?: string;
    enddate?: string;
    SearchTarget?: string;
    disposition?: SantralDisposition | '';
    extension?: string;
    src?: string;
    dst?: string;
    did?: string;
    CallType?: SantralCallType | '';
    RouteType?: SantralRouteType | '';
}

export interface SantralPagedFilter extends SantralBaseFilter {
    page?: number;
    limit?: number;
    sort?: string;
    dir?: 'ASC' | 'DESC';
    scanLimit?: number;
    chunkSize?: number;
    /** getcdr: keep false/undefined for the legacy Dashboard raw contract; true returns Logical Calls. */
    logical?: boolean;
}

export interface SantralLiveCall {
    channel: string;
    caller: string;
    caller_name: string;
    caller_contact_name?: string;
    caller_display?: string;
    connected: string;
    connected_name: string;
    connected_contact_name?: string;
    connected_display?: string;
    peer_number: string;
    peer_contact_name?: string;
    peer_extension_name?: string;
    peer_name?: string;
    peer_display?: string;
    call_direction?: string;
    extension: string;
    context: string;
    state: string;
    state_fa: string;
    duration: string;
    application: string;
    application_data: string;
    uniqueid: string;
    linkedid: string;
}

export interface SantralLiveExtension {
    extension: string;
    name: string;
    tech: string;
    dial: string;

    is_registered?: number;
    peer_status?: string;
    ip_address?: string;
    ip_port?: string;

    is_on_call: number;
    state: string;
    state_fa: string;

    peer_number?: string;
    peer_contact_name?: string;
    peer_extension_name?: string;
    peer_name?: string;
    peer_display?: string;
    duration?: string;
    call_direction?: string;

    calls: SantralLiveCall[];
}
export interface SantralLiveStatusResponse {
    ErrCode: number;
    ErrDesc: string;
    total: number;
    ami_user: string;
    extensions: SantralLiveExtension[];
}

export interface SantralDefinitionsResponse {
    ErrCode: number;
    ErrDesc: string;
    summary: {
        extensions_count: number;
        ringgroups_count: number;
        ivr_count: number;
        incoming_count: number;
        trunks_count: number;
        manager_count: number;
    };
    extensions: any[];
    ringgroups: any[];
    ivr_details: any[];
    ivr_entries: any[];
    incoming: any[];
    trunks: any[];
    managers: any[];
}

export type SantralExtensionHealthCode =
    | 'ready'
    | 'on_call'
    | 'ringing'
    | 'dnd_suspected'
    | 'noanswer_warning'
    | 'short_drop'
    | 'offline';

export interface SantralExtensionMonitorItem {
    extension: string;
    name: string;
    tech: string;
    dial: string;

    health_code: SantralExtensionHealthCode | string;
    health_title: string;
    health_class: string;
    health_explain: string;

    is_registered: number;
    peer_status: string;
    ip_address: string;
    ip_port: string;
    device_state: string;
    device_state_fa: string;

    is_on_call: number;
    channel_state: string;
    channel_state_fa: string;
    peer_number: string;
    call_direction: string;
    call_direction_fa: string;
    call_duration: string;

    last_event_name: string;
    last_event_title: string;
    last_event_at: string;
    last_dial_status: string;
    last_dial_status_fa: string;
    last_sip_code: string;
    last_hangup_cause: number;
    last_hangup_cause_txt: string;
    last_reject_at: string;
    last_ring_at: string;
    last_answer_at: string;
    last_short_drop_at: string;
    consecutive_reject_count: number;
    consecutive_noanswer_count: number;
    short_drop_count: number;
    acknowledged_at: string;
    updated_at: string;
}

export interface SantralExtensionMonitorSnapshotResponse {
    ErrCode: number;
    ErrDesc: string;
    monitor: {
        daemon_online: number;
        last_heartbeat_at: string;
        heartbeat_age_seconds: number;
        live_ami_ok: number;
        live_ami_error: string;
    };
    summary: {
        total: number;
        ready: number;
        on_call: number;
        ringing: number;
        warning: number;
        rejected: number;
        short_drop: number;
        offline: number;
    };
    total: number;
    items: SantralExtensionMonitorItem[];
}

export interface SantralExtensionMonitorHistoryItem {
    id: number;
    event_time: string;
    event_name: string;
    event_title: string;
    extension: string;
    peer_number: string;
    direction: string;
    direction_fa: string;
    channel: string;
    linkedid: string;
    uniqueid: string;
    dial_status: string;
    dial_status_fa: string;
    sip_code: string;
    hangup_cause: number;
    hangup_cause_txt: string;
    duration_seconds: number;
    duration_fa: string;
    detail: string;
}

export interface SantralExtensionMonitorHistoryResponse {
    ErrCode: number;
    ErrDesc: string;
    extension: string;
    startdate: string;
    enddate: string;
    total: number;
    items: SantralExtensionMonitorHistoryItem[];
}

export interface SantralExtensionStatusPeriod {
    status_code: string;
    status_title: string;
    status_class: string;
    start_at: string;
    end_at: string;
    is_current: number;
    duration_seconds: number;
    duration_fa: string;
    reason: string;
    peer_number: string;
    direction: string;
    direction_fa: string;
}

export interface SantralExtensionStatusSummaryItem {
    status_code: string;
    status_title: string;
    duration_seconds: number;
    duration_fa: string;
    period_count: number;
}

export interface SantralExtensionCallLeg {
    id: number;
    calldate: string;
    src: string;
    dst: string;
    channel: string;
    dstchannel: string;
    disposition: string;
    duration: number;
    billsec: number;
    uniqueid: string;
    linkedid: string;
}

export interface SantralExtensionLogicalCall {
    call_key: string;
    linkedid: string;
    start_at: string;
    end_at: string;
    direction: string;
    direction_fa: string;
    peer_number: string;
    peer_name: string;
    peer_display: string;
    disposition: string;
    disposition_fa: string;
    duration_seconds: number;
    duration_fa: string;
    ring_seconds: number;
    ring_fa: string;
    talk_seconds: number;
    talk_fa: string;
    answered_by: string;
    attempted_extensions: string[];
    ring_group: string;
    did: string;
    legs_count: number;
    has_recording: number;
    recordingfile: string;
    legs: SantralExtensionCallLeg[];
}

export interface SantralExtensionReportResponse {
    ErrCode: number;
    ErrDesc: string;
    extension: {
        number: string;
        name: string;
        tech: string;
        dial: string;
        current_status_code: string;
        current_status_title: string;
        current_status_class: string;
        current_status_from: string;
        is_registered: number;
        peer_status: string;
        ip_address: string;
        device_state: string;
        last_event_name: string;
        last_event_title: string;
        last_event_at: string;
        last_dial_status: string;
        last_dial_status_fa: string;
        last_hangup_cause: number;
        last_hangup_cause_txt: string;
        consecutive_reject_count: number;
        consecutive_noanswer_count: number;
        short_drop_count: number;
    };
    monitor: {
        daemon_online: number;
        last_heartbeat_at: string;
        heartbeat_age_seconds: number;
    };
    startdate: string;
    enddate: string;
    status_summary: SantralExtensionStatusSummaryItem[];
    status_periods: SantralExtensionStatusPeriod[];
    call_summary: {
        total: number;
        incoming: number;
        outgoing: number;
        internal: number;
        answered: number;
        missed: number;
        busy: number;
        failed: number;
        talk_seconds: number;
        talk_fa: string;
    };
    calls: SantralExtensionLogicalCall[];
    events: SantralExtensionMonitorHistoryItem[];
    retention_days: number;
}
