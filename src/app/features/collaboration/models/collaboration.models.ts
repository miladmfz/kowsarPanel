export type CollaborationPriority = 'Standard' | 'Important' | 'Urgent';

export interface CollaborationRoom {
  roomCode: number;
  roomType: string;
  title: string;
  description: string | null;
  linkedEntityType: string | null;
  linkedEntityCode: string | null;
  directSubject: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  memberRole: string;
  isMuted: boolean;
  unreadCount: number;
}

export interface CollaborationUser {
  subject: string;
  departmentUserCode: number;
  userId: number;
  centralRef: number | null;
  displayName: string;
  userName: string;
  departmentName: string;
  active: boolean;
  isSelf: boolean;
}

export interface CollaborationNotification {
  notificationCode: number;
  roomRef: number;
  postRef: number;
  notificationType: 'Direct' | 'Mention' | 'Acknowledgement' | 'Thread' | 'Reply';
  roomType: string;
  roomTitle: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface CollaborationAction {
  actionCode: number;
  actionKey: string;
  label: string;
  actionType: 'Acknowledge' | 'OpenRoute' | 'InternalEvent';
  target: string | null;
  requiredPermission: string | null;
  isActive: boolean;
}

export interface CollaborationAttachment {
  attachmentCode: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface CollaborationPost {
  postCode: number;
  roomRef: number;
  rootPostRef: number | null;
  parentPostRef: number | null;
  authorSubject: string;
  authorDisplayName: string;
  actorType: 'User' | 'System' | 'Integration' | 'Bot';
  messageType: string;
  body: string;
  priority: CollaborationPriority;
  requireAcknowledgement: boolean;
  scheduledFor: string | null;
  publishedAt: string | null;
  editedAt: string | null;
  createdAt: string;
  isAcknowledged: boolean;
  ackCount: number;
  replyCount: number;
  isFollowed: boolean;
  actions: CollaborationAction[];
  attachments: CollaborationAttachment[];
}

export interface CollaborationBookmark {
  bookmarkCode: number;
  roomRef: number;
  postRef: number | null;
  title: string;
  url: string | null;
  sortOrder: number;
}

export interface CollaborationSearchResult {
  postCode: number;
  roomRef: number;
  roomTitle: string;
  rootPostRef: number | null;
  authorDisplayName: string;
  body: string;
  priority: CollaborationPriority;
  publishedAt: string | null;
  hasAttachment: boolean;
}

export interface CollaborationPlaybookStep {
  playbookStepCode: number;
  title: string;
  sortOrder: number;
  defaultAssigneeSubject: string | null;
}

export interface CollaborationPlaybook {
  playbookCode: number;
  title: string;
  description: string | null;
  isActive: boolean;
  steps: CollaborationPlaybookStep[];
}

export interface CollaborationRunStep {
  runStepCode: number;
  title: string;
  assigneeSubject: string | null;
  status: 'Pending' | 'Running' | 'Done' | 'Skipped';
  sortOrder: number;
  completedAt: string | null;
}

export interface CollaborationRun {
  runCode: number;
  playbookRef: number;
  roomRef: number;
  ownerSubject: string;
  title: string;
  status: string;
  linkedEntityType: string | null;
  linkedEntityCode: string | null;
  startedAt: string;
  completedAt: string | null;
  steps: CollaborationRunStep[];
}

export interface CollaborationGroup {
  groupCode: number;
  groupKey: string;
  title: string;
  memberSubjects: string[];
}

export interface CollaborationIntegration {
  integrationCode: number;
  title: string;
  eventPattern: string;
  targetRoomRef: number;
  webhookUrl: string | null;
  isActive: boolean;
}

export interface CreateRoomCommand {
  roomType: string;
  title: string;
  description?: string;
  linkedEntityType?: string;
  linkedEntityCode?: string;
  memberSubjects?: string[];
}

export interface CreatePostCommand {
  body: string;
  rootPostRef?: number;
  parentPostRef?: number;
  priority: CollaborationPriority;
  requireAcknowledgement: boolean;
  scheduledFor?: string;
  mentionSubjects?: string[];
  mentionGroups?: string[];
  actions?: Array<{
    actionKey: string;
    label: string;
    actionType: 'Acknowledge' | 'OpenRoute' | 'InternalEvent';
    target?: string;
    requiredPermission?: string;
  }>;
}
