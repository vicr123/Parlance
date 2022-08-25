import React from 'react';

let posts = {};
let user = {};


// Fetch is a custom wrapper around the fetch API.
class Fetch {
    /**
     * Define and create custom headers for Fetch requests
     */
    static headers() {
        let headers = {
            "Content-Type": "application/json"
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
    static async performRequest(method, url, resultCallback = () => {}) {
        let err = null;
        // Display loading animation for the user
        let headers = Fetch.headers();

        let result = await fetch(url, {
            method: method,
            headers: headers
        }).catch((error) => {
            err = error;
        }).finally(() => {

        });

        if (err) throw err;
        if (result.status === 204) return {};
        if (result.status < 200 || result.status > 299) throw result;
        resultCallback(result);
        return await result.json();
    }

    /**
     * Use fetch's post request
     * @param {string} url endpoint for fetch request
     * @param {Object} data payload of information
     * @param {Array} headers Headers to include
     */
    static async post(url, data, headers = []) {
        let err = null;
        let result = await fetch(url, {
            method: "POST",
            headers: [
                ...headers,
                ...Fetch.headers()
            ],
            body: JSON.stringify(data)
        }).catch((error) => {
            err = error;
        }).finally(() => {
            
        });

        if (err) throw err;
        if (result.status === 204) return {};
        if (result.status < 200 || result.status > 299) throw result;
        return await result.json();
    }

    /**
     * Use fetch's patch request
     * @param {string} url API endpoint to access
     * @param {Object} data Payload to patch with
     */
    static async patch(url, data) {
        let err = null;
        let result = await fetch(`/api${url}`, {
            method: "PATCH",
            headers: Fetch.headers(),
            body: JSON.stringify(data)
        }).catch((error) => {
            err = error;
        }).finally(() => {
        });

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
    static get(url, resultCallback = () => {}) {
        return Fetch.performRequest("GET", url, resultCallback);
    }

    /**
     * DELETE request to specified url
     * @param {string} url url to perform API request
     */
    static delete(url) {
        return Fetch.performRequest("DELETE", url);
    }
    
    //TODO: Implement caching
    
    /**
     * Retrieves post based on postID
     * @param {number} id postID
     */
    static async getPost(id) {
        if (!posts[id]) {
            posts[id] = await Fetch.get(`/posts/${id}`);
        }
        return posts[id];
    }
    /**
     * Get the user based on userID
     * @param {number} id userID from the backend
     */
    static async getUser(id) {
        if (!user[id]) {
            user[id] = await Fetch.get(`/users/${id}`);
        }
        return user[id];
    }
    /**
     * Remove garbage posts with an illegal ID
     * @param {number} id postID
     */
    static invalidatePost(id = -1) {
        if (id === -1) {
            posts = {};
        } else if (posts.hasOwnProperty(id)) {
            delete posts[id];
        }
    }

    static invalidateUser(id) {
        if (user.hasOwnProperty(id)) delete user[id];
    }
    /**
     * Reset objects
     */
    static invalidate() {
        posts = {};
        user = {};
    }
}

export default Fetch;
