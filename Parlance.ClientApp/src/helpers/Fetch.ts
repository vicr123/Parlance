// Fetch is a custom wrapper around the fetch API.
class Fetch {
    /**
     * Define and create custom headers for Fetch requests
     */
    static headers() {
        let headers: { [key: string]: string } = {
            "Content-Type": "application/json",
        };

        let token = window.localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        return headers;
    }

    /**
     * Uses fetch to make a request to the in-house API
     * @param {string} method Type of request to make
     * @param {string} url endpoint for the API call
     * @param {function} resultCallback Callback to call when the result is ready containing raw fetch data
     */
    static async performRequest<T>(
        method: string,
        url: string,
        resultCallback = (result: WebFetchResponse) => {},
    ): Promise<FetchResponse<T>> {
        let err = null;
        // Display loading animation for the user
        let headers = Fetch.headers();

        let result = (await fetch(url, {
            method: method,
            headers: headers,
        })
            .catch(error => {
                err = error;
            })
            .finally(() => {})) as WebFetchResponse;

        if (err) throw err;
        if (result.status < 200 || result.status > 299) {
            try {
                result.jsonBody = await result.json();
            } catch {}
            throw result;
        }

        resultCallback(result);
        if (result.status === 204) return {};
        return (await result.json()) as T;
    }

    /**
     * Use fetch's post request
     * @param {string} url endpoint for fetch request
     * @param {Object} data payload of information
     * @param {Object} headers Headers to include
     * @param resultCallback Callback to call after result is available but before the JSON is retrieved
     */
    static async post<T>(
        url: string,
        data: any,
        headers = {},
        resultCallback = (result: WebFetchResponse) => {},
    ): Promise<T> {
        let err = null;
        let result = (await fetch(url, {
            method: "POST",
            headers: {
                ...headers,
                ...Fetch.headers(),
            },
            body: JSON.stringify(data),
        })
            .catch(error => {
                err = error;
            })
            .finally(() => {})) as WebFetchResponse;

        if (err) throw err;
        if (result.status < 200 || result.status > 299) throw result;

        resultCallback(result);
        if (result.status === 204) return {} as T;
        return await result.json();
    }

    /**
     * Use fetch's patch request
     * @param {string} url API endpoint to access
     * @param {Object} data Payload to patch with
     */
    static async patch<T>(url: string, data: any): Promise<FetchResponse<T>> {
        let err = null;
        let result = (await fetch(`/api${url}`, {
            method: "PATCH",
            headers: Fetch.headers(),
            body: JSON.stringify(data),
        })
            .catch(error => {
                err = error;
            })
            .finally(() => {})) as WebFetchResponse;

        if (err) throw err;
        if (result.status === 204) return {};
        if (result.status < 200 || result.status > 299) throw result;
        return await result.json();
    }

    /**
     * GET request to specific url, used to access in-house API
     * @param {string} url url to perform API request
     * @param {function} resultCallback Callback to call when the result is ready containing raw fetch data
     */
    static get<T>(url: string, resultCallback = () => {}): Promise<T> {
        return Fetch.performRequest("GET", url, resultCallback) as Promise<T>;
    }

    /**
     * DELETE request to specified url
     * @param {string} url url to perform API request
     */
    static delete<T>(url: string): Promise<T> {
        return Fetch.performRequest("DELETE", url) as Promise<T>;
    }
}

export default Fetch;
