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

export interface Phrase {
  id: number;
  text: string;
  lang: number;
}

export interface PhrasePair {
  base: Phrase;
  target: Phrase;
}

export interface ListApiOutput<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
