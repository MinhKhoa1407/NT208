export type Researcher = {
  id: number;
  name: string;
  field: string;
  university: string;
  papers: number;
  match: number;
  avatar?: string | null;
  skills: string[];
};