import axios, { AxiosResponse } from "axios";

import { Language, Lexeme, ListApiOutput, PhrasePair } from "./types";

const apiRoot = "/api/";

export const listLanguages = () =>
  axios
    .get(`${apiRoot}languages/`)
    .then(
      (response: AxiosResponse<ListApiOutput<Language>>) =>
        response.data.results
    );

export const completeLexemes = (lid: string, prompt: string, page?: number) =>
  axios
    .get(`${apiRoot}lexemes/`, {
      params: {
        prompt,
        lid,
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<Lexeme>>) => response.data.results
    );

export const completeAnnotations = (
  lid: string,
  prompt: string,
  page?: number
) =>
  axios
    .get(`${apiRoot}annots/`, {
      params: {
        prompt,
        lid,
        page,
      },
    })
    .then(
      (response: AxiosResponse<ListApiOutput<Lexeme>>) => response.data.results
    );

export const getPairs = (
  base: string,
  target: string,
  lexeme?: number,
  annot?: number,
  page?: number
) =>
  axios
    .get(`${apiRoot}pairs/`, { params: { base, target, lexeme, annot, page } })
    .then(
      (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
        response.data.results
    );

export const getPair = (id: number) =>
  axios
    .get(`${apiRoot}pairs/${id}/`)
    .then((response: AxiosResponse<PhrasePair>) => response.data);
