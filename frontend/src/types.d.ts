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
  annotation?: number;
}

interface Annotation {
  id: number;
  value: string;
  description: string;
}

interface Word {
  id: number;
  lexeme: Lexeme;
  norm: string;
  annotations: Annotation[];
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

export interface ListApiOutput<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

type Coloured<T> = T & { colour?: string };
