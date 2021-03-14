import axios, { AxiosError, AxiosResponse } from "axios";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";

import {
  CreateAccountServerErrors,
  CreateAccountValues,
  CreateSubscriptionValues,
  CreateTrackedListValues,
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
  TrackedList,
  User,
} from "../types";

const apiRoot = "/api/";
const HOUR = 60 * 60 * 1000;

// TODO 05/03/20 psacawa: find solution to handle server errors

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
    { staleTime: HOUR, ...options }
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
    { staleTime: HOUR, ...options }
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
    { staleTime: HOUR, ...options }
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
    { staleTime: HOUR, ...options }
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
    { staleTime: HOUR, ...options }
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

export const useCreateSubscription = (
  options?: UseMutationOptions<Subscription, any, CreateSubscriptionValues>
) =>
  useMutation(
    (params: CreateSubscriptionValues) =>
      axios
        .post("/api/subs/", params)
        .then((response: AxiosResponse<Subscription>) => response.data),
    { ...options }
  );

export const useDeleteSubscription = (
  options?: UseMutationOptions<any, any, { sub_id: number }>
) =>
  useMutation(
    (params: { sub_id: number }) => axios.delete(`/api/subs/${params.sub_id}/`),
    { ...options }
  );

export const useCreateTrackedList = (
  options?: UseMutationOptions<CreateTrackedListValues>
) =>
  useMutation((params: CreateTrackedListValues) =>
    axios
      .post("/api/lists/")
      .then((response: AxiosResponse<TrackedList>) => response.data)
  );

export const useSubs = (
  options?: UseQueryOptions<PaginatedApiOutput<Subscription<true>>>
) =>
  useQuery(
    ["subs"],
    () =>
      axios
        .get("/api/subs/")
        .then(
          (response: AxiosResponse<PaginatedApiOutput<Subscription<true>>>) =>
            response.data
        ),
    options
  );

export const useList = (
  params: { id: number },
  options?: UseQueryOptions<TrackedList<true>>
) =>
  useQuery(["lists", params.id], () =>
    axios
      .get(`/api/lists/${params.id}/?expand=subscription`)
      .then((response: AxiosResponse<TrackedList<true>>) => response.data)
  );

export const useSub = (
  params: { id: number },
  options?: UseQueryOptions<Subscription>
) =>
  useQuery(
    ["sub", params.id],
    () =>
      axios
        .get(`/api/subs/${params.id}`)
        .then((response: AxiosResponse<Subscription>) => response.data),
    options
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

export const useTrackObservable = (
  options?: UseMutationOptions<
    any,
    unknown,
    { id: number; observable_id: number }
  >
) =>
  useMutation(
    (params: { id: number; observable_id: number }) =>
      axios.post(`/api/lists/${params.id}/obs/`, {
        observable: params.observable_id,
      }),
    { ...options }
  );

export const useUntrackObservable = (
  options?: UseMutationOptions<unknown, any, any>
) =>
  useMutation(
    (params: { id: number; observable_id: number }) =>
      axios.delete(`/api/lists/${params.id}/obs/${params.observable_id}/`),
    { ...options }
  );

export const useTrainingPlan = (
  params: { list_id: number },
  options?: UseQueryOptions<PaginatedApiOutput<PhrasePair>, { id: number }>
) =>
  useQuery(
    ["plan", { ...params }],
    () =>
      axios
        .get(`/api/lists/${params.list_id}/plan/`)
        .then(
          (response: AxiosResponse<PaginatedApiOutput<PhrasePair>>) =>
            response.data
        ),
    { ...options }
  );
