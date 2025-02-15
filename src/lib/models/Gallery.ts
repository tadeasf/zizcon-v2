import { DirectusFile } from './DirectusFile';
import { DirectusStatus } from './DirectusStatus';

export interface GalleryFile {
  id: string;
  gallery_id: string;
  directus_files_id: DirectusFile;
}

export interface Gallery {
  id: string;
  status: DirectusStatus;
  sort: number;
  date_updated: string;
  title: string;
  header: DirectusFile | null;
  gallery_files: GalleryFile[];
} 