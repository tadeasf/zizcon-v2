import { DirectusFile } from './DirectusFile';
import { DirectusStatus } from './DirectusStatus';

export interface BlogPost {
  id: string;
  status: DirectusStatus;
  sort: number;
  user_created: string;
  user_updated: string;
  date_created: string;
  date_updated: string;
  title: string;
  content: string;
  header: DirectusFile | null;
}
