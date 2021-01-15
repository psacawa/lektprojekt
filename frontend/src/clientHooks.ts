import axios, { AxiosResponse } from "axios";
import { useQuery } from "react-query";

import { Language, Lexeme, ListApiOutput, PhrasePair } from "./types";

const apiRoot = "/api/";

export const useLanguages = () =>
  useQuery(
    "languages",
    () =>
      axios
        .get(`${apiRoot}languages/`)
        .then(
          (response: AxiosResponse<ListApiOutput<Language>>) =>
            response.data.results
        ),
    {}
  );

export const useLexemes = (params: {
  id: number;
  prompt: string;
  page?: number;
}) =>
  useQuery(
    ["lexemes", { ...params }],
    () =>
      axios
        .get(`${apiRoot}lexemes/`, {
          params,
        })
        .then(
          (response: AxiosResponse<ListApiOutput<Lexeme>>) =>
            response.data.results
        ),
    {}
  );

export const useAnnotations = (params: {
  id: number;
  prompt: string;
  page?: number;
}) =>
  useQuery(["annotations", { ...params }], () =>
    axios
      .get(`${apiRoot}annots/`, {
        params,
      })
      .then(
        (response: AxiosResponse<ListApiOutput<Lexeme>>) =>
          response.data.results
      )
  );

export const usePairFeatureSearch = (params: {
  baseId: number;
  targetId: number;
  lexemes?: number[];
  annotations?: number[];
  page?: number;
}) =>
  useQuery(["pairs-feature-search", { ...params }], () =>
    axios
      .get(`${apiRoot}pairs/`, {
        params: {
          ...params,
          lexemes: params.lexemes?.join(","),
          annots: params.annotations?.join(","),
        },
      })
      .then(
        (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
          response.data.results
      )
  );

export const usePairLexemeSearch = (params: {
  baseId: number;
  targetId: number;
  lexemes?: number[];
  page?: number;
}) =>
  useQuery(["pairs-feature-search", { ...params }], () =>
    axios
      .get(`${apiRoot}pairs/`, {
        params: {
          ...params,
          lexemes: params.lexemes?.join(","),
        },
      })
      .then(
        (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
          response.data.results
      )
  );

export const usePairAnnotationSearch = (params: {
  baseId: number;
  targetId: number;
  annotations?: number[];
  page?: number;
}) =>
  useQuery(["pairs-annotation-search", { ...params }], () =>
    axios
      .get(`${apiRoot}pairs/`, {
        params: {
          ...params,
          annots: params.annotations?.join(","),
        },
      })
      .then(
        (response: AxiosResponse<ListApiOutput<PhrasePair>>) =>
          response.data.results
      )
  );

export const usePair = (id: number) =>
  useQuery(["pair", id], () =>
    axios
      .get(`${apiRoot}pairs/${id}/`)
      .then((response: AxiosResponse<PhrasePair>) => response.data)
  );
