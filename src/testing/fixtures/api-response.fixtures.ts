import {
  CentralPermissionResponse,
  LoginResponse,
  OtpChallengeResponse,
} from 'src/app/auth-kowsar/auth-api.models';
import { WorkforceAbsenceTypeResponse } from 'src/app/features/automation/models/workforce-absence-type.models';

export const AUTH_LOGIN_RESPONSE_FIXTURE: LoginResponse = {
  users: [{
    LoginType: 'KOWSAR',
    UserId: 17,
    CentralRef: 3,
    UserName: 'fixture-user',
    DisplayName: 'Fixture User',
    DepartmentCode: 1,
    NeedChangePassword: '0',
    ErrCode: '0',
  }],
  auth: {
    accessToken: 'fixture-access-token',
    refreshToken: 'fixture-refresh-token',
    subject: 'KOWSAR:17',
  },
};

export const OTP_CHALLENGE_RESPONSE_FIXTURE: OtpChallengeResponse = {
  requiresOtp: true,
  challengeId: 'fixture-challenge-id',
  expiresAt: '2030-01-01T00:00:00Z',
};

export const CENTRAL_PERMISSION_RESPONSE_FIXTURE: CentralPermissionResponse = {
  Permissions: [
    { PermissionKey: 'DASHBOARD_VIEW', RoleName: 'ACCOUNTING_USER' },
    { PermissionKey: 'FACTOR_EDIT', RoleName: 'ACCOUNTING_USER' },
  ],
};

export const WORKFORCE_ABSENCE_TYPE_RESPONSE_FIXTURE: WorkforceAbsenceTypeResponse = {
  WorkforceAbsenceTypes: [{
    AbsenceTypeCode: 4,
    TypeKey: 'ANNUAL',
    TypeTitle: 'مرخصی سالانه',
    CalculationMode: 'DAILY',
    BalanceMode: 'ANNUAL',
    MinimumAdvanceWorkDay: 1,
    AllowFriday: false,
    AllowHoliday: false,
    RequireAttachment: false,
    DeductFromBalance: true,
    DisplayOrder: 1,
    IsActive: true,
    HelpText: null,
  }],
};
