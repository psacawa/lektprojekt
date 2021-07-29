import axios, { AxiosError, AxiosResponse } from "axios";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";

import { apiRoot, authRoot, HOUR } from "../constants";
import {
  CreateAccountServerErrors,
  CreateAccountValues,
  CreateSubscriptionValues,
  CreateTrackedListValues,
  Feature,
  Language,
  LanguagePair,
  Lexeme,
  LoginServerErrors,
  LoginSuccessPayload,
  LoginValues,
  Paginate,
  PairCount,
  PhrasePair,
  Subscription,
  Tracked,
  TrackedList,
  User,
} from "../types";

// TODO 05/03/20 psacawa: find solution to handle server errors

export const useLanguages = (options?: UseQueryOptions<Language[]>) =>
  useQuery(
    "languages",
    () =>
      axios
        .get(`${apiRoot}languages/`)
        .then(
          (response: AxiosResponse<Paginate<Language>>) => response.data.results
        ),
    { staleTime: HOUR, ...options }
  );

export const usePairCounts = (options?: UseQueryOptions<PairCount[]>) =>
  useQuery("pair-count", () =>
    axios
      .get(`${apiRoot}pair-counts/`)
      .then((response: AxiosResponse<PairCount[]>) => response.data)
  );

export const useSupportedLanguagePairs = (
  options?: UseQueryOptions<LanguagePair[]>
) =>
  useQuery(`${apiRoot}supported-language-pairs/`, () =>
    axios
      .get(`${apiRoot}supported-language-pairs/`)
      .then((response: AxiosResponse<LanguagePair[]>) => response.data)
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
          (response: AxiosResponse<Paginate<Lexeme>>) => response.data.results
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
  options?: UseQueryOptions<Paginate<PhrasePair>>
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
        .then((response: AxiosResponse<Paginate<PhrasePair>>) => response.data),
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
          (response: AxiosResponse<Paginate<PhrasePair>>) =>
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
          (response: AxiosResponse<Paginate<PhrasePair>>) =>
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
  useQuery(["user"], () =>
    axios
      .get(`${authRoot}auth/user/`)
      .then((response: AxiosResponse<User>) => response.data)
  );

export const useCreateSubscription = (
  options?: UseMutationOptions<Subscription, any, CreateSubscriptionValues>
) =>
  useMutation(
    (params: CreateSubscriptionValues) =>
      axios
        .post(`${apiRoot}subs/`, params)
        .then((response: AxiosResponse<Subscription>) => response.data),
    { ...options }
  );

export const useDeleteSubscription = (
  options?: UseMutationOptions<any, any, { sub_id: number }>
) =>
  useMutation(
    (params: { sub_id: number }) =>
      axios.delete(`${apiRoot}subs/${params.sub_id}/`),
    { ...options }
  );

export const useTrackedList = (
  params: { id: number },
  // options?: UseQueryOptions<TrackedList<true>>
  options?: UseQueryOptions<TrackedList<true>>
) =>
  useQuery(["lists", params.id], () =>
    axios
      .get(`${apiRoot}lists/${params.id}/?expand=subscription`)
      .then((response: AxiosResponse<TrackedList<true>>) => response.data)
  );

export const useCreateTrackedList = (
  options?: UseMutationOptions<TrackedList, any, CreateTrackedListValues>
) =>
  useMutation(
    (params: CreateTrackedListValues) =>
      axios
        .post(`${apiRoot}lists/`, params)
        .then((response: AxiosResponse<TrackedList>) => response.data),
    options
  );

export const useUpdateTrackedList = (
  options?: UseMutationOptions<any, any, { id: number; name?: string }>
) =>
  useMutation(
    (params) =>
      axios
        .patch(`${apiRoot}lists/${params.id}/`, params)
        .then((response: AxiosResponse<TrackedList>) => response.data),
    options
  );

export const useDeleteTrackedList = (
  options?: UseMutationOptions<void, any, { list_id: number }>
) =>
  useMutation(
    (params) => axios.delete(`${apiRoot}lists/${params.list_id}/`),
    options
  );

export const useSubs = (
  options?: UseQueryOptions<Paginate<Subscription<true>>>
  // options?: UseQueryOptions<
  //   Paginate<Subscription<true>>,
  //   unknown,
  //   Paginate<Subscription<true>> | Subscription<true>
  // >
) =>
  useQuery(
    ["subs"],
    () =>
      axios
        .get(`${apiRoot}subs/`)
        .then(
          (response: AxiosResponse<Paginate<Subscription<true>>>) =>
            response.data
        ),
    options
  );

export const useSub = (
  params: { id: number },
  options?: UseQueryOptions<Subscription>
) =>
  useQuery(
    ["sub", params.id],
    () =>
      axios
        .get(`${apiRoot}subs/${params.id}`)
        .then((response: AxiosResponse<Subscription>) => response.data),
    options
  );

export const useTrackedLexemes = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<Paginate<Tracked<Lexeme>>>
) =>
  useQuery(["tracked-lexemes", { ...params }], () =>
    axios
      .get(`${apiRoot}lists/${params.id}/lexemes/`)
      .then(
        (response: AxiosResponse<Paginate<Tracked<Lexeme>>>) => response.data
      )
  );

export const useTrackedFeatures = (
  params: {
    id: number;
  },
  options?: UseQueryOptions<Paginate<Tracked<Feature>>>
) =>
  useQuery(["tracked-features", { ...params }], () =>
    axios
      .get(`${apiRoot}lists/${params.id}/features/`)
      .then(
        (response: AxiosResponse<Paginate<Tracked<Feature>>>) => response.data
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
      axios.post(`${apiRoot}lists/${params.id}/obs/`, {
        observable: params.observable_id,
      }),
    { ...options }
  );

export const useUntrackObservable = (
  options?: UseMutationOptions<unknown, any, any>
) =>
  useMutation(
    (params: { id: number; observable_id: number }) =>
      axios.delete(`${apiRoot}lists/${params.id}/obs/${params.observable_id}/`),
    { ...options }
  );

export const useTrainingPlan = (
  params: { list_id: number; page_size: number },
  options?: UseQueryOptions<PhrasePair[], { id: number }>
) =>
  useQuery(
    ["plan", { ...params }],
    () =>
      axios
        .get(`${apiRoot}lists/${params.list_id}/plan/`, {
          params: { page_size: params.page_size },
        })
        .then(
          (response: AxiosResponse<Paginate<PhrasePair>>) =>
            response.data.results
        ),
    { ...options }
  );

export const useScoreQuestion = (option?: UseMutationOptions<any, any>) =>
  useMutation((params: { list_id: number; phrase_id: number; grade: number }) =>
    axios.post(`${apiRoot}lists/${params.list_id}/score/`, {
      phrase: params.phrase_id,
      grade: params.grade,
    })
  );
