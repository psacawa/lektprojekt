import axios, { AxiosError, AxiosResponse } from "axios";
import {
  MutateFunction,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";

import {
  Annotation,
  CreateAccountServerErrors,
  CreateAccountValues,
  Language,
  Lexeme,
  LoginServerErrors,
  LoginSuccessPayload,
  LoginValues,
  PaginatedApiOutput,
  PhrasePair,
  User,
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
    pageSize?: number;
  },
  options?: UseQueryOptions<PaginatedApiOutput<PhrasePair>>
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
            page_size: params.pageSize,
          },
        })
        .then(
          (response: AxiosResponse<PaginatedApiOutput<PhrasePair>>) =>
            response.data
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

export const useUser = (options?: UseQueryOptions<User>) =>
  useQuery(
    ["user"],
    () =>
      axios
        .get("/auth/user/")
        .then((response: AxiosResponse<User>) => response.data),
    { refetchOnWindowFocus: false, ...options }
  );

export const useLogin = (
  options?: UseMutationOptions<
    LoginSuccessPayload,
    LoginServerErrors,
    LoginValues
  >
) =>
  useMutation((params: LoginValues) => {
    return axios
      .post("/auth/login/", { ...params })
      .then((response: AxiosResponse<any>) => response.data)
      .catch((error: AxiosError<any>) => Promise.reject(error.response?.data));
  }, options);

export const useLogout = (options?: UseMutationOptions) =>
  useMutation(() => {
    return axios
      .post("/auth/logout/")
      .then((response: AxiosResponse<any>) => response.data);
  }, options);

export const useCreateAccount = (
  options?: UseMutationOptions<
    { detail: string },
    CreateAccountServerErrors,
    CreateAccountValues
  >
) =>
  useMutation<
    { detail: string },
    CreateAccountServerErrors,
    CreateAccountValues
  >((params: CreateAccountValues) => {
    return axios
      .post("/auth/registration/", { ...params })
      .then((response: AxiosResponse<{ detail: string }>) => response.data)
      .catch((error: AxiosError<any>) => Promise.reject(error.response?.data));
  }, options);

export const useCsrfToken = (options?: UseQueryOptions) =>
  useQuery(
    ["csrf"],
    () =>
      axios.get("/csrf-token/").then((response: AxiosResponse<unknown>) => {
        console.log(response.headers["csrf_token"]);
      }),
    options
  );
