export type BiWidgetType = 'kpi' | 'trend' | 'table' | 'stackedBar' | 'donut' | 'pivot' | 'summaryList';
export type BiGrain = 'day' | 'month';
export type BiMetricKey = string;
export type BiLifecycleStatus = 'Draft' | 'Published' | 'Deprecated';
export type BiComparisonMode = 'none' | 'previousPeriod' | 'previousYear' | 'custom';

export interface BiDatasetField {
  fieldKey: string;
  title: string;
  dataType: string;
  fieldRole: string;
  unit?: string | null;
  allowedAggregations: string[];
  allowedOperators: string[];
  status: BiLifecycleStatus;
  definitionVersion: number;
}

export interface BiMetric {
  metricKey: string;
  title: string;
  metricRole: string;
  definition: string;
  formula?: string | null;
  unit?: string | null;
  precision: number;
  status: BiLifecycleStatus;
  definitionVersion: number;
}

export interface BiDataset {
  datasetKey: string;
  title: string;
  domain: string;
  description: string;
  requiredPermission: string;
  maxRows: number;
  maxRangeDays: number;
  cacheSeconds: number;
  defaultDateField: string;
  definitionVersion: number;
  status: BiLifecycleStatus;
  sourceName: string;
  sourceDescription: string;
  freshnessSlaMinutes: number;
  fields: BiDatasetField[];
  metrics: BiMetric[];
}

export interface BiCatalog {
  datasets: BiDataset[];
  widgetTypes: BiWidgetType[];
  departments: BiDepartment[];
}

export interface BiDepartment {
  departmentCode: number;
  departmentName: string;
}

export interface BiQueryRequest {
  datasetKey: string;
  fromDate: string;
  toDate: string;
  grain: BiGrain;
  departmentRefs: number[];
  comparisonFromDate?: string;
  comparisonToDate?: string;
}

export interface BiSalesPoint {
  period: string;
  invoiceCount: number;
  quantity: number;
  grossSales: number;
  returnAmount: number;
  netSales: number;
  averageInvoiceValue: number;
  returnRate: number;
  values?: Record<string, number>;
}

export interface BiSalesSummary {
  netSales: number;
  grossSales: number;
  returnAmount: number;
  invoiceCount: number;
  quantity: number;
  averageInvoiceValue: number;
  returnRate: number;
  values?: Record<string, number>;
}

export interface BiSalesSegment extends BiSalesSummary {
  period: string;
  departmentCode: number;
  departmentName: string;
}

export interface BiComparison {
  fromDate: string;
  toDate: string;
  summary: BiSalesSummary;
  rows: BiSalesPoint[];
  segments: BiSalesSegment[];
}

export interface BiSourceMetadata {
  sourceName: string;
  description: string;
  tables: string[];
  dataThroughDate?: string | null;
  freshnessStatus: 'Current' | 'BehindSelectedRange' | 'NoData' | string;
  freshnessSlaMinutes: number;
}

export interface BiQueryResponse {
  datasetKey: string;
  fromDate: string;
  toDate: string;
  grain: BiGrain;
  appliedDepartmentRefs: number[];
  summary: BiSalesSummary;
  rows: BiSalesPoint[];
  segments: BiSalesSegment[];
  comparison?: BiComparison | null;
  source: BiSourceMetadata;
  asOfUtc: string;
  elapsedMs: number;
  truncated: boolean;
  cacheHit: boolean;
  definitionVersion: number;
  warnings: string[];
}

export interface BiWidgetConfig {
  schemaVersion?: number;
  metric?: BiMetricKey;
  metrics?: BiMetricKey[];
  numberFormat?: 'number' | 'currency' | 'compact' | 'percent';
  groupBy?: 'period' | 'department';
  comparison?: 'none' | 'value' | 'percent';
  fromDate?: string;
  toDate?: string;
  departmentRefs?: number[];
  maxItems?: number;
}

export interface BiDashboardFilter {
  fromDate: string;
  toDate: string;
  grain: BiGrain;
  departmentRefs: number[];
  comparisonMode: BiComparisonMode;
  comparisonFromDate: string;
  comparisonToDate: string;
}

export interface BiDashboardWidget {
  widgetCode: number;
  widgetKey: string;
  widgetType: BiWidgetType;
  datasetKey: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sortOrder: number;
  configVersion: number;
  config: BiWidgetConfig;
}

export interface BiDashboard {
  dashboardCode: number;
  title: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  lastViewedAt?: string | null;
  packKey?: string | null;
  rowVersion: string;
  filters: BiDashboardFilter;
  widgets: BiDashboardWidget[];
  isOwner?: boolean;
  accessLevel?: 'Owner' | 'Edit' | 'Copy' | 'View';
  isTemplate?: boolean;
  publishState?: 'Draft' | 'Published';
  publishedVersion?: number;
  templateDescription?: string | null;
  publishedAt?: string | null;
  publishedBySubject?: string | null;
  sourceDashboardRef?: number | null;
  scopeAdjusted?: boolean;
}

export interface BiShareTarget { targetType: 'User' | 'Role'; targetKey: string; title: string; subtitle?: string | null; }
export interface BiDashboardShare {
  shareCode: number; targetType: 'User' | 'Role'; targetKey: string; targetTitle: string;
  accessLevel: 'View' | 'Copy' | 'Edit'; isDefault: boolean; priority: number;
  createdAt: string; updatedAt: string; rowVersion: string;
}
export interface BiDashboardVersion { versionNumber: number; changeNote?: string | null; restoredFromVersion?: number | null; createdBySubject: string; createdAt: string; }
export interface BiBookmarkWidgetState { widgetKey: string; sortField?: string | null; sortDirection?: 'asc' | 'desc' | null; drillDimension?: string | null; drillValue?: string | null; }
export interface BiBookmarkState { filters: BiDashboardFilter; widgets: BiBookmarkWidgetState[]; }
export interface BiBookmark { bookmarkCode: number; title: string; state: BiBookmarkState; createdAt: string; updatedAt: string; rowVersion: string; }
export interface BiAuditEvent { auditCode: number; dashboardCode?: number | null; dashboardTitle?: string | null; actorSubject: string; eventType: string; targetType?: string | null; targetKey?: string | null; details?: Record<string, unknown> | null; createdAt: string; }

export interface BiManagementPack {
  packKey: string;
  title: string;
  domain: string;
  description: string;
  datasetKey: string;
  primaryKpis: string[];
  drivers: string[];
  guardrails: string[];
  isInstalled: boolean;
  dashboardCode?: number | null;
}

export interface BiDashboardWriteRequest {
  title: string;
  isDefault: boolean;
  rowVersion?: string;
  filters: BiDashboardFilter;
  widgets: Array<Omit<BiDashboardWidget, 'widgetCode'>>;
}

export interface BiDependency {
  kind: 'Metric' | 'Widget' | string;
  key: string;
  title: string;
}

export interface BiAdminField extends BiDatasetField {
  fieldCode: number;
  isSensitive: boolean;
  sortOrder: number;
  rowVersion: string;
  dependencies: BiDependency[];
}

export interface BiAdminMetricVersion {
  definitionVersion: number;
  title: string;
  metricRole: string;
  definition: string;
  formula?: string | null;
  unit?: string | null;
  precision: number;
  status: BiLifecycleStatus;
  changedBy: string;
  changedAt: string;
}

export interface BiAdminMetric extends BiMetric {
  metricCode: number;
  sortOrder: number;
  rowVersion: string;
  versions: BiAdminMetricVersion[];
  widgetDependencyCount: number;
}

export interface BiAdminDataset extends Omit<BiDataset, 'fields' | 'metrics'> {
  datasetCode: number;
  handlerKey: string;
  sortOrder: number;
  rowVersion: string;
  fields: BiAdminField[];
  metrics: BiAdminMetric[];
}

export interface BiAdminCatalog {
  datasets: BiAdminDataset[];
}

export interface BiDatasetUpdateRequest {
  title: string;
  domain: string;
  description: string;
  status: BiLifecycleStatus;
  maxRows: number;
  maxRangeDays: number;
  cacheSeconds: number;
  sourceName: string;
  sourceDescription: string;
  freshnessSlaMinutes: number;
  sortOrder: number;
  rowVersion: string;
}

export interface BiFieldUpdateRequest {
  title: string;
  dataType: string;
  fieldRole: string;
  unit?: string | null;
  allowedAggregations: string[];
  allowedOperators: string[];
  isSensitive: boolean;
  status: BiLifecycleStatus;
  sortOrder: number;
  confirmDependencyChange: boolean;
  rowVersion: string;
}

export interface BiMetricUpdateRequest {
  title: string;
  metricRole: string;
  definition: string;
  formula?: string | null;
  unit?: string | null;
  precision: number;
  status: BiLifecycleStatus;
  sortOrder: number;
  rowVersion: string;
}

export interface BiAsyncJob {
  jobCode: number;
  jobType: 'Query' | 'Export';
  status: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
  attemptCount: number;
  contentType?: string | null;
  fileName?: string | null;
  errorCode?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  expiresAt: string;
  rowVersion: string;
}

export interface BiSchedule {
  scheduleCode: number;
  title: string;
  scheduleType: 'Snapshot' | 'Alert';
  cadence: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  query: BiQueryRequest;
  metricKey?: string | null;
  thresholdOperator?: '>' | '>=' | '<' | '<=' | '=' | '!=' | null;
  thresholdValue?: number | null;
  isEnabled: boolean;
  retentionDays: number;
  nextRunAt: string;
  lastRunAt?: string | null;
  lastStatus?: string | null;
  createdAt: string;
  updatedAt: string;
  rowVersion: string;
}

export interface BiSnapshot {
  snapshotCode: number;
  scheduleCode: number;
  datasetKey: string;
  definitionVersion: number;
  summary: BiSalesSummary;
  dataThroughDate?: string | null;
  freshnessStatus: string;
  createdAt: string;
  expiresAt: string;
}

export interface BiAlertEvent {
  alertCode: number;
  scheduleCode: number;
  metricKey: string;
  thresholdOperator: string;
  thresholdValue: number;
  observedValue: number;
  isBreached: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface BiDatasetHealth {
  datasetKey: string;
  queryCount: number;
  averageMs: number;
  p95Ms: number;
  maxMs: number;
  cacheHitRate: number;
  failureRate: number;
  timeoutCount: number;
  staleCount: number;
}

export interface BiOperationsHealth {
  windowDays: number;
  queryCount: number;
  averageMs: number;
  p95Ms: number;
  maxMs: number;
  cacheHitRate: number;
  failureRate: number;
  timeoutCount: number;
  staleCount: number;
  pendingJobs: number;
  runningJobs: number;
  failedJobs: number;
  dueSchedules: number;
  lastCleanupAt?: string | null;
  datasets: BiDatasetHealth[];
  recommendations: string[];
}

export interface BiPilotCriterion {
  key: string;
  title: string;
  status: 'Passed' | 'Pending' | 'Manual' | 'Rejected';
  currentValue: number;
  targetValue?: number | null;
  unit: string;
  evidence: string;
}

export interface BiPilotMetricReview {
  metricKey: string;
  title: string;
  metricRole: string;
  definition: string;
  formula?: string | null;
  unit?: string | null;
  precision: number;
  definitionVersion: number;
  signOffStatus: string;
}

export interface BiPilotReview {
  reviewCode: number;
  datasetKey: string;
  definitionVersion: number;
  roleCoverageStatus: 'Pending' | 'Approved' | 'Rejected';
  roleCoverageNote?: string | null;
  businessSignOffStatus: 'Pending' | 'Approved' | 'Rejected';
  businessSignOffNote?: string | null;
  decision: 'Pending' | 'Approve' | 'ApproveWithActions' | 'Reject';
  reviewedAt: string;
  rowVersion: string;
}

export interface BiPilotReviewWriteRequest {
  datasetKey: string;
  definitionVersion: number;
  roleCoverageStatus: 'Pending' | 'Approved' | 'Rejected';
  roleCoverageNote?: string | null;
  businessSignOffStatus: 'Pending' | 'Approved' | 'Rejected';
  businessSignOffNote?: string | null;
  decision: 'Pending' | 'Approve' | 'ApproveWithActions' | 'Reject';
  rowVersion?: string | null;
}

export type BiPilotPersona = 'Manager' | 'ReportViewer';

export interface BiPilotParticipantOption {
  userRef: number;
  departmentRef: number;
  displayName: string;
  departmentName: string;
  isSelected: boolean;
  persona?: BiPilotPersona | null;
}

export interface BiPilotParticipant {
  participantCode: number;
  userRef: number;
  departmentRef: number;
  displayName: string;
  departmentName: string;
  persona: BiPilotPersona;
}

export interface BiPilotParticipantConfiguration {
  datasetKey: string;
  definitionVersion: number;
  updatedAt?: string | null;
  rowVersion?: string | null;
  participants: BiPilotParticipant[];
  options: BiPilotParticipantOption[];
}

export interface BiPilotParticipantWriteRequest {
  datasetKey: string;
  definitionVersion: number;
  participants: Array<{ userRef: number; departmentRef: number; persona: BiPilotPersona }>;
  rowVersion?: string | null;
}

export interface BiPilotReadiness {
  datasetKey: string;
  datasetTitle: string;
  definitionVersion: number;
  windowDays: number;
  targetQueries: number;
  attemptedQueries: number;
  eligibleQueries: number;
  prePilotEligibleQueries: number;
  remainingQueries: number;
  syntheticQueries: number;
  automatedQueries: number;
  availablePilotUsers: number;
  availablePilotDepartments: number;
  selectedPilotUsers: number;
  selectedPilotDepartments: number;
  hasManagerParticipant: boolean;
  hasReportViewerParticipant: boolean;
  hasReportViewerRole: boolean;
  configurationReady: boolean;
  distinctActors: number;
  distinctScopes: number;
  progressPercentage: number;
  averageMs: number;
  p95Ms: number;
  maxMs: number;
  failureRate: number;
  staleCount: number;
  pilotEvidenceFrom?: string | null;
  firstEligibleQueryAt?: string | null;
  lastEligibleQueryAt?: string | null;
  technicalGatePassed: boolean;
  rolloutReady: boolean;
  roleCoverageStatus: string;
  businessSignOffStatus: string;
  review?: BiPilotReview | null;
  criteria: BiPilotCriterion[];
  metrics: BiPilotMetricReview[];
  warnings: string[];
}

export interface BiCleanupResult {
  expiredJobs: number;
  expiredSnapshots: number;
  expiredAlerts: number;
  expiredQueryAudits: number;
  completedAt: string;
}

export interface BiScheduleWriteRequest {
  title: string;
  scheduleType: 'Snapshot' | 'Alert';
  cadence: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  query: BiQueryRequest;
  metricKey?: string | null;
  thresholdOperator?: '>' | '>=' | '<' | '<=' | '=' | '!=' | null;
  thresholdValue?: number | null;
  isEnabled: boolean;
  retentionDays: number;
}

export interface BiAnalyticsRequest {
  query: BiQueryRequest;
  metricKey: string;
  horizon: number;
  sensitivity: number;
}

export interface BiObservation { period: string; value: number; }
export interface BiDepartmentBreakdown { departmentCode: number; departmentName: string; value: number; }
export interface BiAnomaly {
  period: string; actual: number; baseline: number; deviation: number; deviationPercent: number;
  score: number; confidence: number; direction: 'AboveBaseline' | 'BelowBaseline' | string; explanation: string;
}
export interface BiForecastPoint { period: string; value: number; lowerBound: number; upperBound: number; }
export interface BiBacktest { trainingPoints: number; testPoints: number; mae: number; mape: number; wape: number; quality: 'High' | 'Medium' | 'Low' | string; }
export interface BiForecast {
  status: 'Ready' | 'InsufficientData' | string; method: string; seasonality: string; horizon: number;
  confidence: number; backtest?: BiBacktest | null; points: BiForecastPoint[]; warnings: string[];
}
export interface BiGuidedInsight {
  kind: string; severity: 'High' | 'Medium' | 'Warning' | 'Info' | string; title: string;
  description: string; period?: string | null; evidenceValue?: number | null; recommendedAction: string;
}
export interface BiAnalyticsResponse {
  datasetKey: string; metricKey: string; metricTitle: string; unit: string; definitionVersion: number;
  appliedDepartmentRefs: number[]; observations: BiObservation[]; departmentBreakdown: BiDepartmentBreakdown[];
  anomalies: BiAnomaly[]; forecast: BiForecast; insights: BiGuidedInsight[]; source: BiSourceMetadata;
  asOfUtc: string; warnings: string[];
}

export interface BiNaturalLanguageRequest {
  text: string; fromDate: string; toDate: string; grain: BiGrain; departmentRefs: number[];
}
export interface BiNaturalLanguageResponse {
  status: 'ReadyForConfirmation' | 'NotUnderstood' | string; confidence: number; normalizedText: string;
  datasetKey?: string | null; datasetTitle?: string | null; metricKey?: string | null; metricTitle?: string | null;
  query?: BiQueryRequest | null; matchedTerms: string[]; warnings: string[]; requiresConfirmation: boolean;
}
