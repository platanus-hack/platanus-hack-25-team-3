export interface Character {
  name: string;
  description: string;
}

export interface Setting {
  name: string;
  description: string;
}

export interface Chapter {
  id: number;
  title: string;
  summary: string;
  characters: Character[];
  settings: Setting[];
}
