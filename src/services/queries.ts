import { useQuery } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  AuthControllerGetChallengeParams,
  DepositDto,
  FinalizeWithdrawalDto,
  OrderControllerGetUserOrdersParams,
  WithdrawRequestDto,
  WorkerControllerGetBatchSubmitted200,
  WorkerControllerGetBatchSubmittedParams,
  WorkerControllerGetSettlementBatches200,
  WorkerControllerGetSettlementBatchesParams,
  WorkerControllerGetSolvencyReports200,
  WorkerControllerGetSolvencyReportsParams,
  WorkerControllerGetVolatilityRegimes200,
  WorkerControllerGetVolatilityRegimesParams,
} from "./models";

import { customClient } from "./custom-client";
import type { ErrorType } from "./custom-client";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// ─── Auth ────────────────────────────────────────────────────────────────────

export type authControllerGetChallengeResponse200 = { data: void; status: 200 };
export type authControllerGetChallengeResponseSuccess =
  authControllerGetChallengeResponse200 & { headers: Headers };
export type authControllerGetChallengeResponse =
  authControllerGetChallengeResponseSuccess;

export const getAuthControllerGetChallengeUrl = (
  params: AuthControllerGetChallengeParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/auth/challenge?${stringifiedParams}`
    : `/api/auth/challenge`;
};

export const authControllerGetChallenge = async (
  params: AuthControllerGetChallengeParams,
  options?: RequestInit,
): Promise<authControllerGetChallengeResponse> => {
  return customClient<authControllerGetChallengeResponse>(
    getAuthControllerGetChallengeUrl(params),
    { ...options, method: "GET" },
  );
};

export type authControllerLoginResponse201 = { data: void; status: 201 };
export type authControllerLoginResponseSuccess =
  authControllerLoginResponse201 & { headers: Headers };
export type authControllerLoginResponse = authControllerLoginResponseSuccess;

export const getAuthControllerLoginUrl = () => `/api/auth/login`;

export const authControllerLogin = async (
  options?: RequestInit,
): Promise<authControllerLoginResponse> => {
  return customClient<authControllerLoginResponse>(getAuthControllerLoginUrl(), {
    ...options,
    method: "POST",
  });
};

export type authControllerGetWssKeyResponse200 = { data: void; status: 200 };
export type authControllerGetWssKeyResponseSuccess =
  authControllerGetWssKeyResponse200 & { headers: Headers };
export type authControllerGetWssKeyResponse =
  authControllerGetWssKeyResponseSuccess;

export const getAuthControllerGetWssKeyUrl = () => `/api/auth/wss-key`;

export const authControllerGetWssKey = async (
  options?: RequestInit,
): Promise<authControllerGetWssKeyResponse> => {
  return customClient<authControllerGetWssKeyResponse>(
    getAuthControllerGetWssKeyUrl(),
    { ...options, method: "GET" },
  );
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export type orderControllerGetUserOrdersResponse200 = { data: void; status: 200 };
export type orderControllerGetUserOrdersResponseSuccess =
  orderControllerGetUserOrdersResponse200 & { headers: Headers };
export type orderControllerGetUserOrdersResponse =
  orderControllerGetUserOrdersResponseSuccess;

export const getOrderControllerGetUserOrdersUrl = (
  params?: OrderControllerGetUserOrdersParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/orders/user?${stringifiedParams}`
    : `/api/orders/user`;
};

export const orderControllerGetUserOrders = async (
  params?: OrderControllerGetUserOrdersParams,
  options?: RequestInit,
): Promise<orderControllerGetUserOrdersResponse> => {
  return customClient<orderControllerGetUserOrdersResponse>(
    getOrderControllerGetUserOrdersUrl(params),
    { ...options, method: "GET" },
  );
};

export const getOrderControllerGetUserOrdersQueryKey = (
  params?: OrderControllerGetUserOrdersParams,
) => [`/api/orders/user`, ...(params ? [params] : [])] as const;

export const getOrderControllerGetUserOrdersQueryOptions = <
  TData = Awaited<ReturnType<typeof orderControllerGetUserOrders>>,
  TError = ErrorType<unknown>,
>(
  params?: OrderControllerGetUserOrdersParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof orderControllerGetUserOrders>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getOrderControllerGetUserOrdersQueryKey(params);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof orderControllerGetUserOrders>>
  > = ({ signal }) =>
    orderControllerGetUserOrders(params, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof orderControllerGetUserOrders>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type OrderControllerGetUserOrdersQueryResult = NonNullable<
  Awaited<ReturnType<typeof orderControllerGetUserOrders>>
>;
export type OrderControllerGetUserOrdersQueryError = ErrorType<unknown>;

export function useOrderControllerGetUserOrders<
  TData = Awaited<ReturnType<typeof orderControllerGetUserOrders>>,
  TError = ErrorType<unknown>,
>(
  params?: OrderControllerGetUserOrdersParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof orderControllerGetUserOrders>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getOrderControllerGetUserOrdersQueryOptions(
    params,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Account ─────────────────────────────────────────────────────────────────

export type accountControllerGetBalanceResponse200 = { data: void; status: 200 };
export type accountControllerGetBalanceResponseSuccess =
  accountControllerGetBalanceResponse200 & { headers: Headers };
export type accountControllerGetBalanceResponse =
  accountControllerGetBalanceResponseSuccess;

export const getAccountControllerGetBalanceUrl = () => `/api/account/balance`;

export const accountControllerGetBalance = async (
  options?: RequestInit,
): Promise<accountControllerGetBalanceResponse> => {
  return customClient<accountControllerGetBalanceResponse>(
    getAccountControllerGetBalanceUrl(),
    { ...options, method: "GET" },
  );
};

export const getAccountControllerGetBalanceQueryKey = () =>
  [`/api/account/balance`] as const;

export const getAccountControllerGetBalanceQueryOptions = <
  TData = Awaited<ReturnType<typeof accountControllerGetBalance>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof accountControllerGetBalance>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customClient>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getAccountControllerGetBalanceQueryKey();
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof accountControllerGetBalance>>
  > = ({ signal }) =>
    accountControllerGetBalance({ signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof accountControllerGetBalance>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type AccountControllerGetBalanceQueryResult = NonNullable<
  Awaited<ReturnType<typeof accountControllerGetBalance>>
>;
export type AccountControllerGetBalanceQueryError = ErrorType<unknown>;

export function useAccountControllerGetBalance<
  TData = Awaited<ReturnType<typeof accountControllerGetBalance>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof accountControllerGetBalance>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customClient>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getAccountControllerGetBalanceQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type paymentControllerRequestWithdrawalResponse201 = {
  data: void;
  status: 201;
};
export type paymentControllerRequestWithdrawalResponseSuccess =
  paymentControllerRequestWithdrawalResponse201 & { headers: Headers };
export type paymentControllerRequestWithdrawalResponse =
  paymentControllerRequestWithdrawalResponseSuccess;

export const getPaymentControllerRequestWithdrawalUrl = () =>
  `/api/payment/withdraw`;

export const paymentControllerRequestWithdrawal = async (
  withdrawRequestDto: WithdrawRequestDto,
  options?: RequestInit,
): Promise<paymentControllerRequestWithdrawalResponse> => {
  return customClient<paymentControllerRequestWithdrawalResponse>(
    getPaymentControllerRequestWithdrawalUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(withdrawRequestDto),
    },
  );
};

export type paymentControllerDebugDepositResponse201 = {
  data: void;
  status: 201;
};
export type paymentControllerDebugDepositResponseSuccess =
  paymentControllerDebugDepositResponse201 & { headers: Headers };
export type paymentControllerDebugDepositResponse =
  paymentControllerDebugDepositResponseSuccess;

export const getPaymentControllerDebugDepositUrl = () =>
  `/api/payment/debug/deposit`;

export const paymentControllerDebugDeposit = async (
  depositDto: DepositDto,
  options?: RequestInit,
): Promise<paymentControllerDebugDepositResponse> => {
  return customClient<paymentControllerDebugDepositResponse>(
    getPaymentControllerDebugDepositUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(depositDto),
    },
  );
};

export type paymentControllerDebugFinalizeWithdrawalResponse201 = {
  data: void;
  status: 201;
};
export type paymentControllerDebugFinalizeWithdrawalResponseSuccess =
  paymentControllerDebugFinalizeWithdrawalResponse201 & { headers: Headers };
export type paymentControllerDebugFinalizeWithdrawalResponse =
  paymentControllerDebugFinalizeWithdrawalResponseSuccess;

export const getPaymentControllerDebugFinalizeWithdrawalUrl = () =>
  `/api/payment/debug/finalize-withdrawal`;

export const paymentControllerDebugFinalizeWithdrawal = async (
  finalizeWithdrawalDto: FinalizeWithdrawalDto,
  options?: RequestInit,
): Promise<paymentControllerDebugFinalizeWithdrawalResponse> => {
  return customClient<paymentControllerDebugFinalizeWithdrawalResponse>(
    getPaymentControllerDebugFinalizeWithdrawalUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(finalizeWithdrawalDto),
    },
  );
};

export type paymentControllerGetActiveWithdrawalSessionResponse200 = {
  data: void;
  status: 200;
};
export type paymentControllerGetActiveWithdrawalSessionResponseSuccess =
  paymentControllerGetActiveWithdrawalSessionResponse200 & { headers: Headers };
export type paymentControllerGetActiveWithdrawalSessionResponse =
  paymentControllerGetActiveWithdrawalSessionResponseSuccess;

export const getPaymentControllerGetActiveWithdrawalSessionUrl = () =>
  `/api/payment/withdrawal/session`;

export const paymentControllerGetActiveWithdrawalSession = async (
  options?: RequestInit,
): Promise<paymentControllerGetActiveWithdrawalSessionResponse> => {
  return customClient<paymentControllerGetActiveWithdrawalSessionResponse>(
    getPaymentControllerGetActiveWithdrawalSessionUrl(),
    { ...options, method: "GET" },
  );
};

// ─── Worker ──────────────────────────────────────────────────────────────────

export type workerControllerGetBatchSubmittedResponse200 = {
  data: WorkerControllerGetBatchSubmitted200;
  status: 200;
};
export type workerControllerGetBatchSubmittedResponse400 = {
  data: void;
  status: 400;
};
export type workerControllerGetBatchSubmittedResponseSuccess =
  workerControllerGetBatchSubmittedResponse200 & { headers: Headers };
export type workerControllerGetBatchSubmittedResponseError =
  workerControllerGetBatchSubmittedResponse400 & { headers: Headers };
export type workerControllerGetBatchSubmittedResponse =
  | workerControllerGetBatchSubmittedResponseSuccess
  | workerControllerGetBatchSubmittedResponseError;

export const getWorkerControllerGetBatchSubmittedUrl = (
  params: WorkerControllerGetBatchSubmittedParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/v1/worker/events/batch-submitted?${stringifiedParams}`
    : `/api/v1/worker/events/batch-submitted`;
};

export const workerControllerGetBatchSubmitted = async (
  params: WorkerControllerGetBatchSubmittedParams,
  options?: RequestInit,
): Promise<workerControllerGetBatchSubmittedResponse> => {
  return customClient<workerControllerGetBatchSubmittedResponse>(
    getWorkerControllerGetBatchSubmittedUrl(params),
    { ...options, method: "GET" },
  );
};

export const getWorkerControllerGetBatchSubmittedQueryKey = (
  params?: WorkerControllerGetBatchSubmittedParams,
) =>
  [
    `/api/v1/worker/events/batch-submitted`,
    ...(params ? [params] : []),
  ] as const;

export const getWorkerControllerGetBatchSubmittedQueryOptions = <
  TData = Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetBatchSubmittedParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ??
    getWorkerControllerGetBatchSubmittedQueryKey(params);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>
  > = ({ signal }) =>
    workerControllerGetBatchSubmitted(params, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type WorkerControllerGetBatchSubmittedQueryResult = NonNullable<
  Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>
>;
export type WorkerControllerGetBatchSubmittedQueryError = ErrorType<void>;

export function useWorkerControllerGetBatchSubmitted<
  TData = Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetBatchSubmittedParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetBatchSubmitted>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getWorkerControllerGetBatchSubmittedQueryOptions(
    params,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

export type workerControllerGetSettlementBatchesResponse200 = {
  data: WorkerControllerGetSettlementBatches200;
  status: 200;
};
export type workerControllerGetSettlementBatchesResponse400 = {
  data: void;
  status: 400;
};
export type workerControllerGetSettlementBatchesResponseSuccess =
  workerControllerGetSettlementBatchesResponse200 & { headers: Headers };
export type workerControllerGetSettlementBatchesResponseError =
  workerControllerGetSettlementBatchesResponse400 & { headers: Headers };
export type workerControllerGetSettlementBatchesResponse =
  | workerControllerGetSettlementBatchesResponseSuccess
  | workerControllerGetSettlementBatchesResponseError;

export const getWorkerControllerGetSettlementBatchesUrl = (
  params: WorkerControllerGetSettlementBatchesParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/v1/worker/events/settlement-batches?${stringifiedParams}`
    : `/api/v1/worker/events/settlement-batches`;
};

export const workerControllerGetSettlementBatches = async (
  params: WorkerControllerGetSettlementBatchesParams,
  options?: RequestInit,
): Promise<workerControllerGetSettlementBatchesResponse> => {
  return customClient<workerControllerGetSettlementBatchesResponse>(
    getWorkerControllerGetSettlementBatchesUrl(params),
    { ...options, method: "GET" },
  );
};

export const getWorkerControllerGetSettlementBatchesQueryKey = (
  params?: WorkerControllerGetSettlementBatchesParams,
) =>
  [
    `/api/v1/worker/events/settlement-batches`,
    ...(params ? [params] : []),
  ] as const;

export const getWorkerControllerGetSettlementBatchesQueryOptions = <
  TData = Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetSettlementBatchesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ??
    getWorkerControllerGetSettlementBatchesQueryKey(params);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>
  > = ({ signal }) =>
    workerControllerGetSettlementBatches(params, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type WorkerControllerGetSettlementBatchesQueryResult = NonNullable<
  Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>
>;
export type WorkerControllerGetSettlementBatchesQueryError = ErrorType<void>;

export function useWorkerControllerGetSettlementBatches<
  TData = Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetSettlementBatchesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetSettlementBatches>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getWorkerControllerGetSettlementBatchesQueryOptions(
    params,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

export type workerControllerGetSolvencyReportsResponse200 = {
  data: WorkerControllerGetSolvencyReports200;
  status: 200;
};
export type workerControllerGetSolvencyReportsResponse400 = {
  data: void;
  status: 400;
};
export type workerControllerGetSolvencyReportsResponseSuccess =
  workerControllerGetSolvencyReportsResponse200 & { headers: Headers };
export type workerControllerGetSolvencyReportsResponseError =
  workerControllerGetSolvencyReportsResponse400 & { headers: Headers };
export type workerControllerGetSolvencyReportsResponse =
  | workerControllerGetSolvencyReportsResponseSuccess
  | workerControllerGetSolvencyReportsResponseError;

export const getWorkerControllerGetSolvencyReportsUrl = (
  params: WorkerControllerGetSolvencyReportsParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/v1/worker/events/solvency-reports?${stringifiedParams}`
    : `/api/v1/worker/events/solvency-reports`;
};

export const workerControllerGetSolvencyReports = async (
  params: WorkerControllerGetSolvencyReportsParams,
  options?: RequestInit,
): Promise<workerControllerGetSolvencyReportsResponse> => {
  return customClient<workerControllerGetSolvencyReportsResponse>(
    getWorkerControllerGetSolvencyReportsUrl(params),
    { ...options, method: "GET" },
  );
};

export const getWorkerControllerGetSolvencyReportsQueryKey = (
  params?: WorkerControllerGetSolvencyReportsParams,
) =>
  [
    `/api/v1/worker/events/solvency-reports`,
    ...(params ? [params] : []),
  ] as const;

export const getWorkerControllerGetSolvencyReportsQueryOptions = <
  TData = Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetSolvencyReportsParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ??
    getWorkerControllerGetSolvencyReportsQueryKey(params);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>
  > = ({ signal }) =>
    workerControllerGetSolvencyReports(params, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type WorkerControllerGetSolvencyReportsQueryResult = NonNullable<
  Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>
>;
export type WorkerControllerGetSolvencyReportsQueryError = ErrorType<void>;

export function useWorkerControllerGetSolvencyReports<
  TData = Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetSolvencyReportsParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetSolvencyReports>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getWorkerControllerGetSolvencyReportsQueryOptions(
    params,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

export type workerControllerGetVolatilityRegimesResponse200 = {
  data: WorkerControllerGetVolatilityRegimes200;
  status: 200;
};
export type workerControllerGetVolatilityRegimesResponse400 = {
  data: void;
  status: 400;
};
export type workerControllerGetVolatilityRegimesResponseSuccess =
  workerControllerGetVolatilityRegimesResponse200 & { headers: Headers };
export type workerControllerGetVolatilityRegimesResponseError =
  workerControllerGetVolatilityRegimesResponse400 & { headers: Headers };
export type workerControllerGetVolatilityRegimesResponse =
  | workerControllerGetVolatilityRegimesResponseSuccess
  | workerControllerGetVolatilityRegimesResponseError;

export const getWorkerControllerGetVolatilityRegimesUrl = (
  params: WorkerControllerGetVolatilityRegimesParams,
) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined)
      normalizedParams.append(key, value === null ? "null" : value.toString());
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0
    ? `/api/v1/worker/events/volatility-regimes?${stringifiedParams}`
    : `/api/v1/worker/events/volatility-regimes`;
};

export const workerControllerGetVolatilityRegimes = async (
  params: WorkerControllerGetVolatilityRegimesParams,
  options?: RequestInit,
): Promise<workerControllerGetVolatilityRegimesResponse> => {
  return customClient<workerControllerGetVolatilityRegimesResponse>(
    getWorkerControllerGetVolatilityRegimesUrl(params),
    { ...options, method: "GET" },
  );
};

export const getWorkerControllerGetVolatilityRegimesQueryKey = (
  params?: WorkerControllerGetVolatilityRegimesParams,
) =>
  [
    `/api/v1/worker/events/volatility-regimes`,
    ...(params ? [params] : []),
  ] as const;

export const getWorkerControllerGetVolatilityRegimesQueryOptions = <
  TData = Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetVolatilityRegimesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ??
    getWorkerControllerGetVolatilityRegimesQueryKey(params);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>
  > = ({ signal }) =>
    workerControllerGetVolatilityRegimes(params, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    staleTime: 10000,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type WorkerControllerGetVolatilityRegimesQueryResult = NonNullable<
  Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>
>;
export type WorkerControllerGetVolatilityRegimesQueryError = ErrorType<void>;

export function useWorkerControllerGetVolatilityRegimes<
  TData = Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>,
  TError = ErrorType<void>,
>(
  params: WorkerControllerGetVolatilityRegimesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof workerControllerGetVolatilityRegimes>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customClient>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getWorkerControllerGetVolatilityRegimesQueryOptions(
    params,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}
