import axios, { AxiosResponse } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import {
  Annotation,
  Language,
  Lexeme,
  PaginatedApiOutput,
  PhrasePair,
} from "./types";

const apiRoot = "/api/";

export const useLanguages = (options?: UseQueryOptions<Language[]>) =>
  useQuery(
    "languages",
    () =>
      axios
        .get(`${apiRoot}languages/`)
        .then(
          (response: AxiosResponse<PaginatedApiOutput<Language>>) =>
            response.data.results
        ),
    { ...options }
  );

export const useLexeme = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<Lexeme>
) =>
  useQuery(
    ["lexeme", { ...params }],
    () =>
      axios
        .get(`${apiRoot}lexemes/${params.id}/`)
        .then((response: AxiosResponse<Lexeme>) => response.data),
    { ...options }
  );

export const useLexemes = (
  params: {
    prompt: string;
    lang?: number;
    page?: number;
  },
  options?: UseQueryOptions<Lexeme[]>
) =>
  useQuery(
    ["lexemes", { ...params }],
    () =>
      axios
        .get(`${apiRoot}lexemes/`, {
          params,
        })
        .then(
          (response: AxiosResponse<PaginatedApiOutput<Lexeme>>) =>
            response.data.results
        ),
    { ...options }
  );

export const useAnnotation = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<Annotation>
) =>
  useQuery(
    ["annotation", { ...params }],
    () =>
      axios
        .get(`${apiRoot}annotations/${params.id}/`)
        .then((response: AxiosResponse<Annotation>) => response.data),
    { ...options }
  );

export const useAnnotations = (
  params: {
    lang?: number;
  },
  options?: UseQueryOptions<Annotation[]>
) =>
  useQuery(
    ["annotations", { ...params }],
    () =>
      axios
        .get(`${apiRoot}annots/`, {
          params,
        })
        .then((response: AxiosResponse<Annotation[]>) => response.data),
    { ...options }
  );

export const usePairFeatureSearch = (
  params: {
    baseLang?: number;
    targetLang?: number;
    lexemes?: number[];
    annotations?: number[];
    page?: number;
  },
  options?: UseQueryOptions<PhrasePair[]>
) =>
  useQuery(
    ["pairs-feature-search", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/search/`, {
          params: {
            base: params.baseLang,
            target: params.targetLang,
            lexemes: params.lexemes?.join(","),
            annots: params.annotations?.join(","),
            page: params.page,
          },
        })
        .then(
          (response: AxiosResponse<PaginatedApiOutput<PhrasePair>>) =>
            response.data.results
        ),
    { ...options }
  );

export const usePairLexemeSearch = (
  params: {
    baseLang?: number;
    targetLang?: number;
    lexemes?: number[];
    page?: number;
  },
  options?: UseQueryOptions<PhrasePair[]>
) =>
  useQuery(
    ["pairs-feature-search", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/lexeme-search`, {
          params: {
            ...params,
            lexemes: params.lexemes?.join(","),
          },
        })
        .then(
          (response: AxiosResponse<PaginatedApiOutput<PhrasePair>>) =>
            response.data.results
        ),
    { ...options }
  );

export const usePairAnnotationSearch = (
  params: {
    baseLang?: number;
    targetLang?: number;
    annotations?: number[];
    page?: number;
  },
  options?: UseQueryOptions<PhrasePair[]>
) =>
  useQuery(
    ["pairs-annotation-search", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/annot-search`, {
          params: {
            ...params,
            annots: params.annotations?.join(","),
          },
        })
        .then(
          (response: AxiosResponse<PaginatedApiOutput<PhrasePair>>) =>
            response.data.results
        ),
    { ...options }
  );

export const usePair = (
  params: { id: number },
  options?: UseQueryOptions<PhrasePair>
) =>
  useQuery(
    ["pair", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/${params.id}/`)
        .then((response: AxiosResponse<PhrasePair>) => response.data),
    { ...options }
  );
