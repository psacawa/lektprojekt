import { CircularProgress } from "@material-ui/core";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "react-query";

import { apiRoot, authRoot, HOUR } from "../constants";
import {
  CreateAccountServerErrors,
  CreateAccountValues,
  LoginServerErrors,
  LoginSuccessPayload,
  LoginValues,
  User,
} from "../types";
interface AuthContextContent {
  login: ReturnType<typeof useLogin>;
  logout: ReturnType<typeof useLogout>;
  createAccount: ReturnType<typeof useCreateAccount>;
  resetPassword: ReturnType<typeof useResetPassword>;
  user: User | null;
}

const AuthContext = React.createContext<AuthContextContent>(
  {} as AuthContextContent
);

export const AuthProvider = (props: any) => {
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  let hasToken = useRef<boolean>(false);

  // if the compoenent is mounting for the first time , try to get authToken from
  // localStorage
  useLayoutEffect(() => {
    if (firstAttempt) {
      hasToken.current = initToken();
      setFirstAttempt(false);
    }
  }, [firstAttempt]);

  // acquire clients and query hooks
  const queryClient = useQueryClient();
  const userQuery = useUser({
    onError: (error) => {
      window.localStorage.removeItem("authToken");
    },
    onSuccess: (data) => {
      console.log(`success: ${data!.username}`);
      setUser(data);
    },
    enabled: hasToken.current,
  });
  const login = useLogin({
    onSuccess: (data: { key: string }) => {
      setToken(data.key);
      queryClient.refetchQueries(["user"]);
    },
  });
  const logout = useLogout({
    onMutate: (variables) => {
      removeToken();
      queryClient.refetchQueries(["user"]);
      hasToken.current = false;
    },
  });
  const createAccount = useCreateAccount();

  return (
    <>
      {/* {!userQuery.isFetching ? ( */}
      {!userQuery.isFetching ? (
        <AuthContext.Provider
          value={{ user, login, logout, createAccount }}
          {...props}
        />
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

const useLogin = (
  options?: UseMutationOptions<
    LoginSuccessPayload,
    LoginServerErrors,
    LoginValues
  >
) =>
  useMutation((params: LoginValues) => {
    return axios
      .post(`${authRoot}login/`, { ...params })
      .then((response: AxiosResponse<any>) => response.data)
      .catch((error: AxiosError<any>) => Promise.reject(error.response?.data));
  }, options);

const useLogout = (options?: UseMutationOptions) =>
  useMutation(() => {
    return axios
      .post(`${authRoot}logout/`)
      .then((response: AxiosResponse<any>) => response.data);
  }, options);

const useCreateAccount = (
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
      .post(`${authRoot}registration/`, { ...params })
      .then((response: AxiosResponse<{ detail: string }>) => response.data)
      .catch((error: AxiosError<any>) => Promise.reject(error.response?.data));
  }, options);

export const useResetPassword = (options?: UseMutationOptions<{}, any, any>) =>
  useMutation(
    (params: { email: string }) =>
      axios
        .post(`${authRoot}password/reset/`, { ...params })
        .then((response: AxiosResponse<any>) => response.data),
    options
  );

// only try to acquire use information if authToken set, otherwise short to null,
// which represents "no user"
// TODO 10/03/20 psacawa: this implementation doesn't account for a failed network request
const useUser = (options?: UseQueryOptions<User | null>) =>
  useQuery(
    ["user"],
    () => {
      if (tokenLoaded()) {
        return axios
          .get(`${authRoot}user/`)
          .then((response: AxiosResponse<User>) => response.data)
          .catch((error: AxiosError<any>) => {
            if (error.response!.status < 500) {
              return Promise.resolve(null);
            } else {
              return Promise.reject(error);
            }
          });
      } else {
        return Promise.resolve(null);
      }
    },
    { refetchOnWindowFocus: false, ...options }
  );

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth hook must be used within the AuthProvider");
  }
  return context;
};

// init the token in the http client axios from localStorage on page load
// return whether or not the authToken was present in localStorage
function initToken() {
  const token = window.localStorage.getItem("authToken");
  if (!!token) {
    axios.defaults.headers["Authorization"] = `Token ${token}`;
  }
  return !!token;
}
function setToken(token: string) {
  window.localStorage.setItem("authToken", token);
  axios.defaults.headers["Authorization"] = `Token ${token}`;
}

function removeToken() {
  window.localStorage.removeItem("authToken");
  axios.defaults.headers["Authorization"] = undefined;
}

function tokenLoaded() {
  return axios.defaults.headers["Authorization"] !== undefined;
}
