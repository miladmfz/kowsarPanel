export type PhoneCallStatus =
  | 'idle'
  | 'calling'
  | 'sent'
  | 'holding'
  | 'hangingup'
  | 'ended'
  | 'busy'
  | 'noanswer'
  | 'rejected'
  | 'error';

export type RegisterStatus =
  | 'offline'
  | 'connecting'
  | 'registered'
  | 'failed';

export type LineStatus =
  | 'empty'
  | 'incoming'
  | 'dialing'
  | 'ringing'
  | 'active'
  | 'held'
  | 'ended'
  | 'failed';

export type CallDirection =
  | 'incoming'
  | 'outgoing'
  | 'missed';

export interface WebPhoneLine {
  index: number;
  label: string;
  session: any | null;
  status: LineStatus;
  number: string;
  name: string;
  direction: 'none' | 'incoming' | 'outgoing';
  muted: boolean;
  held: boolean;
  answered: boolean;
  startedAt: number | null;
  connectedAt: number | null;
}

export interface PhoneBookItem {
  id: number;
  name: string;
  number: string;
  dialNumber: string;
  extension?: string;
  explain?: string;
  centralRef?: number;
  customerCode?: number;
  addressRef?: number;
  isFavorite: boolean;
  favoriteId: number;
}

export interface PhoneCustomerContext {
  lineIndex?: number;
  number: string;
  name: string;
  explain?: string;
  centralRef?: number;
  customerCode?: number;
  addressRef?: number;
  centralName?: string;
  customerName?: string;
  customerExplain?: string;
  appNumber?: string;
  databaseNumber?: string;
  lockNumber?: string;
  customerType?: string;
  economyCode?: string;
  codeMelli?: string;
  manager?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  loading?: boolean;
  source?: 'PHONEBOOK' | 'CALL' | 'MANUAL';
}

export interface CallLogItem {
  id: string;
  direction: CallDirection;
  number: string;
  name: string;
  status: string;
  startedAt: number;
  durationSeconds: number;
  seen?: boolean;
}
