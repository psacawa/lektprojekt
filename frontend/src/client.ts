import axios, { AxiosResponse } from "axios";
import { Language, Voice, Lexeme, ListApiOutput } from "./types";

const apiRoot = "/api/";

export const listLanguages = () => {
  return axios
    .get(`${apiRoot}languages/`)
    .then(
      (response: AxiosResponse<ListApiOutput<Language>>) =>
        response.data.results
    );
};

export const completeLexeme = (lid: string, prompt: string) => {
  return axios
    .get(`${apiRoot}lexemes`, {
      params: {
        prompt,
        lid,
      },
    })
    .then((response: AxiosResponse<ListApiOutput<Lexeme>>) => response.data);
};

export const completeAnnotation = (lid: string, prompt: string) => {
  return axios
    .get(`${apiRoot}annots`, {
      params: {
        prompt,
        lid,
      },
    })
    .then((response: AxiosResponse<ListApiOutput<Lexeme>>) => response.data);
};
