export type Project = {
  name: string;
  date: string;
  slug: string;
  hidden?: boolean;
  description: string;
  tags: string[];
  images: string[];
  collaborators?: string[];
};

export type Gallery = {
  projects: Project[];
};

export type CatagoryTag = {
  name: string;
  color: string;
};
