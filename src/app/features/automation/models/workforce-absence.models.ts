export type WorkforceAbsenceCalculationMode = 'DAY' | 'MINUTE' | 'FLEXIBLE' | 'NONE';
export type WorkforceAbsenceBalanceMode = 'ANNUAL_DAILY' | 'MONTHLY_HOURLY' | 'DAILY_OR_HOURLY' | 'NONE';
export type WorkforceAbsenceRequestMode = 'DAY' | 'MINUTE';
export type WorkforceAbsenceEmploymentType = 'FULL_TIME' | 'PART_TIME' | 'SHIFT' | 'CUSTOM';

export interface WorkforceAbsenceTypeRow {
    AbsenceTypeCode: string;
    TypeKey: string;
    TypeTitle: string;
    CalculationMode: WorkforceAbsenceCalculationMode;
    BalanceMode: WorkforceAbsenceBalanceMode;
    MinimumAdvanceWorkDay: string;
    AllowFriday: string;
    AllowHoliday: string;
    RequireAttachment: string;
    AttachmentRequiredAfterDay: string;
    RequireDescription: string;
    DeductFromBalance: string;
    AllowFullTime: string;
    AllowPartTime: string;
    AllowShift: string;
    AllowCustom: string;
    HelpText: string;
    DisplayOrder: string;
    IsActive: string;
    ErrCode?: string;
    ErrDesc?: string;
}

export interface WorkforceAbsencePolicyRow {
    PolicyCode: string;
    CentralRef: string;
    CentralName?: string;
    EmploymentType: WorkforceAbsenceEmploymentType;
    WorkStartTime: string;
    WorkEndTime: string;
    BreakMinute: string;
    DailyWorkMinute: string;
    AnnualDailyLimit: string;
    MonthlyHourlyLimitMinute: string;
    PartTimeRatio: string;
    RequestSubmitStartTime: string;
    RequestSubmitEndTime: string;
    MinimumDailyAdvanceWorkDay: string;
    MaximumHourlyMinutePerRequest: string;
    ConcurrentLeaveWarningCount: string;
    SickAttachmentRequiredAfterDay: string;
    AllowDaily: string;
    AllowHourly: string;
    AllowSick: string;
    AllowEmergency: string;
    AllowHolidayRequest: string;
    EffectiveFromJDate: string;
    EffectiveToJDate: string;
    Explain: string;
    IsActive: string;
    ErrCode?: string;
    ErrDesc?: string;
}

export interface WorkforceAbsenceRequestRow {
    AbsenceRequestCode: string;
    CentralRef: string;
    CentralName?: string;
    AbsenceTypeRef: string;
    TypeKey: string;
    TypeTitle: string;
    PolicyRef: string;
    RequestMode: WorkforceAbsenceRequestMode;
    RequestJDate: string;
    StartJDate: string;
    EndJDate: string;
    StartTime: string;
    EndTime: string;
    TotalCalendarDay: string;
    TotalWorkDay: string;
    TotalOffDay: string;
    TotalMinute: string;
    Description: string;
    WorkflowStatus: string;
    WorkflowStatusTitle?: string;
    ManagerRef: string;
    ManagerExplain: string;
    AttachmentRequired: string;
    HasAttachment: string;
    IsManagerOverride: string;
    ManagerOverrideReason: string;
    ErrCode?: string;
    ErrDesc?: string;
}

export interface WorkforceAbsenceStatusRow {
    CentralRef: string;
    TargetJDate: string;
    PolicyCode: string;
    EmploymentType: string;
    AnnualDailyLimit: string;
    MonthlyHourlyLimitMinute: string;
    DailyWorkMinute: string;
    WorkStartTime: string;
    WorkEndTime: string;
    RequestSubmitStartTime: string;
    RequestSubmitEndTime: string;
    TotalRequestCount: string;
    PendingRequestCount: string;
    AcceptedRequestCount: string;
    RejectedRequestCount: string;
    ReviewRequestCount: string;
    CancelledRequestCount: string;
    UsedAcceptedDaily: string;
    PendingDaily: string;
    RemainingDaily: string;
    UsedAcceptedHourlyMinute: string;
    PendingHourlyMinute: string;
    RemainingHourlyMinute: string;
    ErrCode?: string;
    ErrDesc?: string;
}
