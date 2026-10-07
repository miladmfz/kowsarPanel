export interface AuthLoginRequest {
  UserType?: string | null;
  UName?: string | null;
  UPass?: string | null;
  UNewPass?: string | null;
  DepartmentCode?: number | null;
  DeviceId?: string | null;
}

export interface AuthenticationTokens {
  accessToken: string;
  refreshToken: string;
  subject: string;
  expiresAt?: string;
  refreshExpiresAt?: string;
  tokenType?: string;
  sessionId?: string;
  tokenVersion?: number;
}

export interface AuthUserRecord {
  LoginType?: string | null;
  UserId?: string | number | null;
  Userid?: string | number | null;
  OldUserId?: string | number | null;
  CentralRef?: string | number | null;
  CentralName?: string | null;
  UserName?: string | null;
  DisplayName?: string | null;
  UserPrintName?: string | null;
  Active?: string | number | boolean | null;
  Success?: string | number | boolean | null;
  DepartmentCode?: string | number | null;
  DepartmentName?: string | null;
  NeedChangePassword?: string | number | boolean | null;
  UserMaxDiscount?: string | number | null;
  UserIdRef?: string | number | null;
  XUserCode?: string | number | null;
  CustomerCode?: string | number | null;
  CustName_Small?: string | null;
  Explain?: string | null;
  PersonInfoRef?: string | number | null;
  PhFullName?: string | null;
  BrokerName?: string | null;
  Manager?: string | null;
  Delegacy?: string | null;
  IsAdminUser?: string | number | boolean | null;
  SessionId?: string | null;
  ActiveDate?: string | null;
  Message?: string | null;
  ErrCode?: string | number | null;
  ErrDesc?: string | null;
  [key: string]: unknown;
}

export interface NormalizedAuthUser {
  LoginType: string;
  AppKey: string;
  HostName: string;
  BasePath: string;
  UserId: string | number;
  OldUserId: string | number;
  CentralRef: string | number;
  CentralName: string;
  UserName: string;
  DisplayName: string;
  UserPrintName: string;
  Active: string | number | boolean;
  DepartmentCode: string | number;
  DepartmentName: string;
  NeedChangePassword: string | number | boolean;
  UserMaxDiscount: string | number;
  UserIdRef: string | number;
  XUserCode: string | number;
  CustomerCode: string | number;
  CustName_Small: string;
  Explain: string;
  PersonInfoRef: string | number;
  PhFullName: string;
  SessionId: string;
  ActiveDate: string;
  Manager?: string;
  Delegacy?: string;
  IsAdminUser?: string | number | boolean;
  Message: string;
  ErrCode: string | number;
}

export interface LoginResponse {
  users?: AuthUserRecord[];
  auth?: AuthenticationTokens;
}

export interface OtpChallengeResponse {
  requiresOtp: true;
  challengeId: string;
  expiresAt: string;
  developmentCode?: string;
}

export interface GuestOtpRequest {
  mobile: string;
}

export interface GuestOtpVerifyRequest {
  challengeId: string;
  code: string;
  deviceId?: string | null;
}

export type CustomerLoginResponse = LoginResponse | OtpChallengeResponse;

export interface PermissionRecord {
  PermissionKey?: string | null;
  RoleName?: string | null;
  [key: string]: unknown;
}

export interface CentralPermissionResponse {
  permissions?: PermissionRecord[];
  Permissions?: PermissionRecord[];
}

export interface RoleRecord {
  RoleCode?: string | number;
  RoleName?: string | null;
  Active?: string | number | boolean;
  [key: string]: unknown;
}

export interface PermissionListRecord extends PermissionRecord {
  PermissionCode?: string | number;
  PermissionName?: string | null;
  Active?: string | number | boolean;
}

export interface CentralUserRecord {
  UserId?: string | number;
  CentralRef?: string | number;
  CentralName?: string | null;
  UserName?: string | null;
  UserNameInPrint?: string | null;
  Active?: string | number | boolean;
  [key: string]: unknown;
}

export interface RolesResponse {
  Roles?: RoleRecord[];
}

export interface PermissionsResponse {
  Permissions?: PermissionListRecord[];
}

export interface RolePermissionsResponse {
  RolePermissions?: PermissionListRecord[];
}

export interface CentralRolesResponse {
  CentralRoles?: RoleRecord[];
}

export interface CentralUsersResponse {
  CentralUsers?: CentralUserRecord[];
}

export interface CentralRoleOption {
  roleCode: number;
  roleName: string;
  roleTitle?: string | null;
  explain?: string | null;
  enabled: boolean;
  locked: boolean;
}

export interface CentralRoleConfiguration {
  centralRef: number;
  centralName: string;
  version: string;
  roles: CentralRoleOption[];
}

export interface UpdateCentralRolesRequest {
  enabledRoleRefs: number[];
  expectedVersion: string;
}

export type AuthSessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface AuthSessionRecord {
  sessionId: string;
  subject: string;
  displayName?: string | null;
  loginType?: string | null;
  centralRef?: number | null;
  userRef?: number | null;
  deviceId?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  status: AuthSessionStatus;
}

export interface AuthSessionsResponse {
  sessions: AuthSessionRecord[];
}
