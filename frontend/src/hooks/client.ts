import axios, { AxiosResponse } from "axios";
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";

import { apiRoot, authRoot, HOUR, paymentRoot } from "../constants";
import {
  CheckoutSession,
  CreateLanguageCourseValues,
  CreateTrackedListValues,
  Feature,
  Language,
  LanguageCourse,
  LanguagePair,
  Lexeme,
  Paginate,
  PairCount,
  PhrasePair,
  Price,
  Tracked,
  TrackedList,
  User,
} from "../types";

// TODO 05/03/20 psacawa: find solution to handle server errors

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // TODO 21/03/20 psacawa: investigate whether this can be safely added
      refetchOnMount: false,
    },
  },
});

////////////////////
// Languages
////////////////////

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
  useQuery(
    "pair-counts",
    () =>
      axios
        .get(`${apiRoot}pair-counts/`)
        .then((response: AxiosResponse<PairCount[]>) => response.data),
    { staleTime: HOUR, ...options }
  );

export const useSupportedLanguagePairs = (
  options?: UseQueryOptions<LanguagePair[]>
) =>
  useQuery(
    "supported-language-pairs",
    () =>
      axios
        .get(`${apiRoot}supported-language-pairs/`)
        .then((response: AxiosResponse<LanguagePair[]>) => response.data),
    { staleTime: HOUR, ...options }
  );

////////////////////
// Lexemes
////////////////////

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

////////////////////
// Features
////////////////////

export const useFeatures = (
  params: {
    lang: number;
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

//////////////////////////////
// Pair Lexeme Search
// Pair Feature Search
// Pair Observable Search
//////////////////////////////

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

// export const useUser = (options?: UseQueryOptions<User>) =>
//   useQuery(["user"], () =>
//     axios
//       .get(`${authRoot}auth/user/`)
//       .then((response: AxiosResponse<User>) => response.data)
//   );

////////////////////
// Language Courses
////////////////////

export const useCourses = (
  options?: UseQueryOptions<Paginate<LanguageCourse<true>>>
) =>
  useQuery(
    ["courses"],
    () =>
      axios
        .get(`${apiRoot}courses/`)
        .then(
          (response: AxiosResponse<Paginate<LanguageCourse<true>>>) =>
            response.data
        ),
    options
  );

export const useCreateCourse = (
  options?: UseMutationOptions<LanguageCourse, any, CreateLanguageCourseValues>
) =>
  useMutation(
    (params: CreateLanguageCourseValues) =>
      axios
        .post(`${apiRoot}courses/`, params)
        .then((response: AxiosResponse<LanguageCourse>) => response.data),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries("courses");
      },
      ...options,
    }
  );

export const useDeleteCourse = (
  options?: UseMutationOptions<any, any, { course_id: number }>
) =>
  useMutation(
    (params: { course_id: number }) =>
      axios.delete(`${apiRoot}courses/${params.course_id}/`),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries("courses");
      },
      ...options,
    }
  );

////////////////////
// TrackedList
////////////////////

export const useTrackedList = (
  params: { id: number },
  // options?: UseQueryOptions<TrackedList<true>>
  options?: UseQueryOptions<TrackedList<true>>
) =>
  useQuery(["lists", params.id], () =>
    axios
      .get(`${apiRoot}lists/${params.id}/?expand=course`)
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
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["courses", result.course]);
      },
      ...options,
    }
  );

export const useUpdateTrackedList = (
  options?: UseMutationOptions<TrackedList, any, { id: number; name?: string }>
) =>
  useMutation(
    (params) =>
      axios
        .patch(`${apiRoot}lists/${params.id}/`, params)
        .then((response: AxiosResponse<TrackedList>) => response.data),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["lists", result.id]);
      },
      ...options,
    }
  );

export const useDeleteTrackedList = (
  options?: UseMutationOptions<void, any, { list_id: number }>
) =>
  useMutation(
    (params) => axios.delete(`${apiRoot}lists/${params.list_id}/`),
    options
  );

////////////////////
// TrackedObservable
// TrackedLexemes
// TrackedFeatures
////////////////////

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

const invalidateTrackedList = (result: any) => {
  queryClient.invalidateQueries([
    "tracked-lexemes",
    { id: result.tracked_list },
  ]);
  queryClient.invalidateQueries([
    "tracked-features",
    { id: result.tracked_list },
  ]);
  queryClient.invalidateQueries([
    "tracked-observables",
    { id: result.tracked_list },
  ]);
  return;
};

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
    {
      onSuccess: invalidateTrackedList,
      ...options,
    }
  );

export const useUntrackObservable = (
  options?: UseMutationOptions<unknown, any, any>
) =>
  useMutation(
    (params: { id: number; observable_id: number }) =>
      axios.delete(`${apiRoot}lists/${params.id}/obs/${params.observable_id}/`),
    {
      onSuccess: invalidateTrackedList,
      ...options,
    }
  );

///////////////////////////
// TrainingPlans/Scoring
///////////////////////////

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
    {
      onSuccess: invalidateTrackedList,
      ...options,
    }
  );

export const useScoreQuestion = (options?: UseMutationOptions<any, any>) =>
  useMutation((params: { list_id: number; phrase_id: number; grade: number }) =>
    axios.post(`${apiRoot}lists/${params.list_id}/score/`, {
      phrase: params.phrase_id,
      grade: params.grade,
    })
  );

///////////////////////////
// Payments
///////////////////////////

export const usePrices = (options?: UseQueryOptions<Price[]>) =>
  useQuery(
    "prices",
    () =>
      axios
        .get(`${paymentRoot}prices/`)
        .then((response: AxiosResponse<Price[]>) => response.data),
    { ...options }
  );

export const useCheckoutSession = (
  params: { session_id: string },
  options?: UseQueryOptions<CheckoutSession>
) =>
  useQuery(["checkout-session", { ...params }], () =>
    axios.get(`${paymentRoot}checkout-session/${params.session_id}`)
  );

export const useCreateCheckoutSession = (
  options?: UseMutationOptions<any, any>
) =>
  useMutation<{ redirect_url: string }, any, any>(
    (params: { price_id: string }) =>
      axios
        .post(`${paymentRoot}checkout-sessions/`, params)
        .then(
          (response: AxiosResponse<{ redirect_url: string }>) => response.data
        ),
    {
      onSuccess: (result) => {
        console.log(result.redirect_url);
        window.location.href = result.redirect_url;
      },
      ...options,
    }
  );
