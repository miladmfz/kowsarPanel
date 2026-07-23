export type SantralCallType =
    | 'Incoming'
    | 'Outgoing'
    | 'Internal'
    | 'IVR'
    | 'RingGroup'
    | 'Transfer'
    | 'Other';

export type SantralDisposition =
    | 'ANSWERED'
    | 'NO ANSWER'
    | 'BUSY'
    | 'FAILED'
    | 'CONGESTION';

export type SantralSpyMode = 'listen' | 'whisper' | 'barge';
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
}

export interface SantralPagedFilter extends SantralBaseFilter {
    page?: number;
    limit?: number;
    sort?: string;
    dir?: 'ASC' | 'DESC';
    scanLimit?: number;
    chunkSize?: number;
}

export interface SantralLiveCall {
    channel: string;
    caller: string;
    caller_name: string;
    connected: string;
    connected_name: string;
    peer_number: string;
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
