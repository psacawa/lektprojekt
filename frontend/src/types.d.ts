export interface Voice {
  id: number;
  lang: number;
  name: string;
  accent: string;
  aid: string;
  gender: string;
}

export interface Language<ExpandVoice extends boolean = false> {
  id: number;
  lid: string;
  name: string;
  default_voice: ExpandVoice extends true ? Voice : number;
  voice_set: Voice[];
}

export interface TokenSpan {
  number: number;
  start: number;
  end: number;
  lexeme?: number;
  feature?: number;
}

export interface Lexeme {
  id: number;
  lemma: string;
  pos: string;
  lang: number;
}

export interface Feature {
  id: number;
  value: string;
  description: string;
}

export type Observable = Lexeme | Feature;

export interface Tracked<T = number> {
  difficulty: number;
  id: number;
  observable: T;
}

export interface Word {
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
  feature_matches?: TokenSpan[];
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

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthData {
  key: string;
}

export interface User {
  id: number;
  profile: number;
  username: string;
  email: string;
}

export interface LoginSuccessPayload extends AuthData {
  user: User;
}

export interface UserState {
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

type ServerErrors<T> = Partial<Record<keyof T | "non_field_errors", string[]>>;
type CreateAccountServerErrors = ServerErrors<CreateAccountValues>;
type LoginServerErrors = ServerErrors<LoginValues>;

interface TrackedList<ExpandSub extends boolean = false> {
  id: number;
  name: string;
  subscription: ExpandSub extends true ? Subscription : number;
}

interface CreateTrackedListValues {
  name: string;
  subscription: number;
}

export interface Subscription<ExpandLang extends boolean = false> {
  id: number;
  lists: TrackedList[];
  base_lang: ExpandLang extends true ? Language : number;
  base_voice: Voice;
  target_lang: ExpandLang extends true ? Language : number;
  target_voice: Voice;
}

export interface CreateSubscriptionValues {
  base_lang: number;
  base_voice: number;
  target_lang: number;
  target_voice: number;
}

export interface PairCount {
  base_lang: string;
  target_lang: string;
  count: number;
}
