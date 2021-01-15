import axios, { AxiosResponse } from "axios";

import {
  Annotation,
  Language,
  Lexeme,
  ListApiOutput,
  PhrasePair,
} from "./types";

const apiRoot = "/api/";

export const listLanguages = () =>
  axios
    .get(`${apiRoot}languages/`)
    .then(
      (response: AxiosResponse<ListApiOutput<Language>>) =>
        response.data.results
    );

export const completeLexemes = (lang: number, prompt: string, page?: number) =>
  axios
    .get(`${apiRoot}lexemes/`, {
      params: {
        lang,
        prompt,
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<Lexeme>>) => response.data.results
    );

export const completeAnnotations = (
  lang: number,
  prompt: string,
  page?: number
) =>
  axios
    .get(`${apiRoot}annots/`, {
      params: {
        lang,
        prompt,
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<Annotation>>) =>
        response.data.results
    );

export const searchPairsByLexemes = (
  baseLang: number,
  targetLang: number,
  lexemes?: number[],
  page?: number
) =>
  axios
    .get(`${apiRoot}pairs/lexeme-search/`, {
      params: {
        base: baseLang,
        target: targetLang,
        lexemes: lexemes?.join(","),
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
        response.data.results
    );

export const searchPairsByAnnotations = (
  baseLang: number,
  targetLang: number,
  annotations?: number[],
  page?: number
) =>
  axios
    .get(`${apiRoot}pairs/search/`, {
      params: {
        base: baseLang,
        target: targetLang,
        annots: annotations?.join(","),
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
        response.data.results
    );

export const searchPairsByFeatures = (
  baseLang: number,
  targetLang: number,
  lexemes?: number[],
  annotations?: number[],
  page?: number
) =>
  axios
    .get(`${apiRoot}pairs/search/`, {
      params: {
        base: baseLang,
        target: targetLang,
        lexemes: lexemes?.join(","),
        annots: annotations?.join(","),
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
        response.data.results
    );

export const getPair = (id: number) =>
  axios
    .get(`${apiRoot}pairs/${id}/`)
    .then((response: AxiosResponse<PhrasePair>) => response.data);
