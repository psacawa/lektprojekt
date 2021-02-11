export interface Lexeme {
  id: number;
  lemma: string;
  pos: string;
  lang: number;
}

export interface Voice {
  id: number;
  lang: number;
  name: string;
  accent: string;
  aid: string;
  gender: string;
}

export interface Language {
  id: number;
  lid: string;
  name: string;
  default_voice: Voice;
}

export interface TokenSpan {
  number: number;
  start: number;
  end: number;
  lexeme?: number;
  feature?: number;
}

interface Feature {
  id: number;
  value: string;
  description: string;
}

interface Word {
  id: number;
  lexeme: Lexeme;
  norm: string;
  features: Feature[];
}

export interface Phrase {
  id: number;
  text: string;
  lang: number;
  lexeme_matches?: TokenSpan[];
  annot_matches?: TokenSpan[];
  words?: Word[];
}

export interface PhrasePair {
  id: number;
  base: Phrase;
  target: Phrase;
}

export interface PaginatedApiOutput<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

type Coloured<T> = T & { colour?: string };

interface LoginData {
  email: string;
  password: string;
}

interface AuthData {
  key: string;
}

interface User {
  id: number;
  profile: number;
  username: string;
  email: string;
}

interface LoginSuccessPayload extends AuthData {
  user: User;
}

interface UserState {
  loggedIn: boolean;
  user?: User;
  key?: string;
}

export interface CreateAccountValues {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export type ServerErrors<T> = Partial<
  Record<keyof T | "non_field_errors", string[]>
>;

export type CreateAccountServerErrors = ServerErrors<CreateAccountValues>;
export type LoginServerErrors = ServerErrors<LoginValues>;

type RootState = ReturnType<typeof import("./store/reducers").default>;
