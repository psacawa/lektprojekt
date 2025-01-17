// payments

export interface Product {
  id: string;
  description: string;
  name: string;
}

export interface Price {
  id: string;
  product: Product;
  currency: string;
  // this is in "cents" | denominowane w groszach
  unit_amount: number;
  recurring: {
    interval: "day" | "month" | "year";
    interval_count: number;
  };
}

export interface FreePrice {
  id: null;
  currency: string;
  product: {
    name: string;
  };
  unit_amount: 0;
}

export interface CheckoutSession {
  id: string;
}

// lekt

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

export interface BaseTokenSpan {
  number: number;
  start: number;
  end: number;
}

export interface LexemeTokenSpan extends BaseTokenSpan {
  lexeme: number;
}

export interface FeatureTokenSpan extends BaseTokenSpan {
  feature: number;
}

export type TokenSpan = LexemeTokenSpan | FeatureTokenSpan;

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
  score: number;
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
  lexeme_matches?: LexemeTokenSpan[];
  feature_matches?: FeatureTokenSpan[];
  words?: Word[];
}

export interface PhrasePair {
  id: number;
  base: Phrase;
  target: Phrase;
}

export interface Paginate<T> {
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
  level: "basic" | "plus";
  has_profile_image: boolean;
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

interface TrackedList<ExpandCourse extends boolean = false> {
  id: number;
  name: string;
  course: ExpandCourse extends true ? LanguageCourse : number;
}

interface CreateTrackedListValues {
  name: string;
  course: number;
}

export interface LanguageCourse<ExpandLang extends boolean = false> {
  id: number;
  lists: TrackedList[];
  base_lang: ExpandLang extends true ? Language : number;
  base_voice: Voice;
  target_lang: ExpandLang extends true ? Language : number;
  target_voice: Voice;
}

export interface CreateLanguageCourseValues {
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

export interface LanguagePair {
  base_lang: number;
  target_lang: number;
  count: number;
}

// the below types hold some information about the application UI, such as the "active"
// list, and the active practice session, for the purpose of providing a user friendly
// flow. In a separate architecture, this would be the content of some react context

interface PracticeState {
  pairs: PhrasePair[];
  activePairIdx: number;
}

interface RootState {
  activeCourseId?: number;
  activeTrackedListId?: number;
  practice?: PracticeState;
}

declare global {
  let __filebasename: string;
}
