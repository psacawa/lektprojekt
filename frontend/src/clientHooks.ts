import axios, { AxiosError, AxiosResponse } from "axios";
import {
  MutateFunction,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";

import {
  CreateAccountServerErrors,
  CreateAccountValues,
  Feature,
  Language,
  Lexeme,
  LoginServerErrors,
  LoginSuccessPayload,
  LoginValues,
  PaginatedApiOutput,
  PhrasePair,
  Subscription,
  Tracked,
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

export const useFeature = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<Feature>
) =>
  useQuery(
    ["feature", { ...params }],
    () =>
      axios
        .get(`${apiRoot}features/${params.id}/`)
        .then((response: AxiosResponse<Feature>) => response.data),
    { ...options }
  );

export const useFeatures = (
  params: {
    lang?: number;
  },
  options?: UseQueryOptions<Feature[]>
) =>
  useQuery(
    ["features", { ...params }],
    () =>
      axios
        .get(`${apiRoot}features/`, {
          params,
        })
        .then((response: AxiosResponse<Feature[]>) => response.data),
    { ...options }
  );

export const usePairObservableSearch = (
  params: {
    baseLang?: number;
    targetLang?: number;
    lexemes?: number[];
    features?: number[];
    page?: number;
    pageSize?: number;
  },
  options?: UseQueryOptions<PaginatedApiOutput<PhrasePair>>
) =>
  useQuery(
    ["pairs-observable-search", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/search/`, {
          params: {
            base: params.baseLang,
            target: params.targetLang,
            lexemes: params.lexemes?.join(","),
            features: params.features?.join(","),
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
    ["pairs-lexeme-search", { ...params }],
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

export const usePairFeatureSearch = (
  params: {
    baseLang?: number;
    targetLang?: number;
    features?: number[];
    page?: number;
  },
  options?: UseQueryOptions<PhrasePair[]>
) =>
  useQuery(
    ["pairs-feature-search", { ...params }],
    () =>
      axios
        .get(`${apiRoot}pairs/feature-search`, {
          params: {
            ...params,
            features: params.features?.join(","),
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

export const useResetPassword = (options?: UseMutationOptions<{}, any, any>) =>
  useMutation(
    (params: { email: string }) =>
      axios
        .post("/auth/password/reset/", { ...params })
        .then((response: AxiosResponse<any>) => response.data),
    options
  );

export const useSubs = (
  options?: UseQueryOptions<PaginatedApiOutput<Subscription>>
) =>
  useQuery(["subs"], () =>
    axios
      .get("/api/subs/")
      .then(
        (response: AxiosResponse<PaginatedApiOutput<Subscription>>) =>
          response.data
      )
  );

export const useTrackedLexemes = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<PaginatedApiOutput<Tracked<Lexeme>>>
) =>
  useQuery(["tracked-lexemes", { ...params }], () =>
    axios
      .get(`/api/lists/${params.id}/lexemes/`)
      .then(
        (response: AxiosResponse<PaginatedApiOutput<Tracked<Lexeme>>>) =>
          response.data
      )
  );

export const useTrackedFeatures = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<PaginatedApiOutput<Tracked<Feature>>>
) =>
  useQuery(["tracked-features", { ...params }], () =>
    axios
      .get(`/api/lists/${params.id}/features/`)
      .then(
        (response: AxiosResponse<PaginatedApiOutput<Tracked<Feature>>>) =>
          response.data
      )
  );

export const useTrackObservable = (options?: UseMutationOptions<any>) =>
  useMutation((params: { id: number; observable_id: number }) =>
    axios.post(`/api/lists/${params.id}/`, {
      observable: params.observable_id,
    })
  );
