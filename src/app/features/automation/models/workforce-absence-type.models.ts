export interface WorkforceAbsenceTypeRecord {
  AbsenceTypeCode: string | number;
  TypeKey: string;
  TypeTitle: string;
  CalculationMode: string;
  BalanceMode: string;
  MinimumAdvanceWorkDay: string | number;
  AllowFriday: string | number | boolean;
  AllowHoliday: string | number | boolean;
  RequireAttachment: string | number | boolean;
  AttachmentRequiredAfterDay?: string | number | null;
  RequireDescription?: string | number | boolean;
  DeductFromBalance: string | number | boolean;
  AllowFullTime?: string | number | boolean;
  AllowPartTime?: string | number | boolean;
  AllowShift?: string | number | boolean;
  AllowCustom?: string | number | boolean;
  HelpText?: string | null;
  DisplayOrder: string | number;
  IsActive: string | number | boolean;
  ErrCode?: string | number | null;
  ErrDesc?: string | null;
  [key: string]: unknown;
}

export interface WorkforceAbsenceTypeQuery {
  AbsenceTypeCode: string;
  OnlyActive: string | null;
}

export type WorkforceAbsenceTypeSaveRequest = Record<string, string | null>;

export interface WorkforceAbsenceTypeResponse {
  WorkforceAbsenceTypes: WorkforceAbsenceTypeRecord[];
}
