import axios, { AxiosResponse } from "axios";
import { Language, Lexeme, ListApiOutput, PhrasePair } from "./types";

const apiRoot = "/api/";

export const listLanguages = () => {
  return axios
    .get(`${apiRoot}languages/`)
    .then(
      (response: AxiosResponse<ListApiOutput<Language>>) =>
        response.data.results
    );
};

export const completeLexemes = (lid: string, prompt: string, page?: number) => {
  return axios
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
};

export const completeAnnotations = (
  lid: string,
  prompt: string,
  page?: number
) => {
  return axios
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
};

export const getSuggestions = (
  base: string,
  target: string,
  lexeme?: number,
  annot?: number,
  page?: number
) => {
  return axios
    .get(`${apiRoot}gimped/`, { params: { base, target, lexeme, annot, page } })
    .then(
      (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
        response.data.results
    );
};
