import { DirectusFile } from './DirectusFile';
import { DirectusStatus } from './DirectusStatus';

export interface PravidlaUcasti {
  id: string;
  status: DirectusStatus;
  sort: number;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  title: string;
  content: string;
  header: DirectusFile | null;
} 