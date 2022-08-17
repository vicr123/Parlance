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
     * @param {boolean} showLoader if true displays a loading animation
     */
    static async performRequest(method, url, showLoader) {
        let err = null;
        // Display loading animation for the user
        // if (showLoader) Loader.mount();
        let headers = Fetch.headers();

        let result = await fetch(url, {
            method: method,
            headers: headers
        }).catch((error) => {
            err = error;
        }).finally(() => {
            // if (showLoader) Loader.unmount();
        });

        if (err) throw err;
        if (result.status === 204) return {};
        if (result.status < 200 || result.status > 299) throw result;
        return await result.json();
    }

    /**
     * Use fetch's post request
     * @param {string} url endpoint for fetch request
     * @param {Object} data payload of information
     * @param {boolean} showLoader if true displays a loading animation
     */
    static async post(url, data, showLoader = true) {
        let err = null;
        // if (showLoader) Loader.mount();
        let result = await fetch(url, {
            method: "POST",
            headers: Fetch.headers(),
            body: JSON.stringify(data)
        }).catch((error) => {
            err = error;
        }).finally(() => {
            // if (showLoader) Loader.unmount();
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
     * @param {boolean} showLoader if true displays a loading animation
     */
    static async patch(url, data, showLoader = true) {
        let err = null;
        // if (showLoader) Loader.mount();
        let result = await fetch(`/api${url}`, {
            method: "PATCH",
            headers: Fetch.headers(),
            body: JSON.stringify(data)
        }).catch((error) => {
            err = error;
        }).finally(() => {
            // if (showLoader) Loader.unmount();
        });

        if (err) throw err;
        if (result.status === 204) return {};
        if (result.status < 200 || result.status > 299) throw result;
        return await result.json();
    }

    /**
     * GET request to specific url, used to access in-house API
     * @param {string} url url to perform API request
     * @param {boolean} showLoader boolean value to display loading animation
     */
    static get(url, showLoader = true) {
        return Fetch.performRequest("GET", url, showLoader);
    }

    /**
     * DELETE request to specified url
     * @param {string} url url to perform API request
     * @param {boolean} showLoader boolean value to display loading animation
     */
    static delete(url, showLoader = true) {
        return Fetch.performRequest("DELETE", url, showLoader);
    }
    
    //TODO: Implement caching
    
    /**
     * Retrieves post based on postID
     * @param {number} id postID
     */
    static async getPost(id) {
        if (!posts[id]) {
            posts[id] = await Fetch.get(`/posts/${id}`, false);
        }
        return posts[id];
    }
    /**
     * Get the user based on userID
     * @param {number} id userID from the backend
     */
    static async getUser(id) {
        if (!user[id]) {
            user[id] = await Fetch.get(`/users/${id}`, false);
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
