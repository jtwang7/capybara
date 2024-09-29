export interface Note {
  uid: string; // auto-generated
  title: string;
  link: string;
  iconUrl?: string; // if undefined, use default icon
  description?: string;
  tags?: string[];
  screenshot?: string; // screenshot image url
  cornell?: {
    points?: string; // note key points
    overview?: string; // ai summary
  };
}
