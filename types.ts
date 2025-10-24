export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  role: Role;
  text: string;
  sources?: Source[];
}
