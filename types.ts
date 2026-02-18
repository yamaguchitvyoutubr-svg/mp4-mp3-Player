
export interface VideoFile {
  id: string;
  file: File;
  name: string;
  url: string;
  type: 'video' | 'audio';
}
