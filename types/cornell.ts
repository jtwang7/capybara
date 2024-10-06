export interface Note {
  uid: string; // auto-generated
  title: string;
  link: string;
  icon_url?: string; // if undefined, use default icon
  description?: string;
  tags?: string[];
  screenshot?: string; // screenshot image url
  point?: string; // note key points
  summary?: string; // ai summary
}
