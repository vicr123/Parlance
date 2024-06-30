interface WebFetchResponse extends Response {
    jsonBody: any;
}

type FetchResponse<T> = T | {};
