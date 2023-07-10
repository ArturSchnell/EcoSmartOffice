import axios, { type AxiosInstance } from "axios";
import type { httpMethods } from "../Types/types";

/**
 * Axios instance for making API requests
 */
const axiosAPI: AxiosInstance = axios.create({
    withCredentials: true,
    baseURL: `${import.meta.env.VITE_BACKEND_ADDRESS}:${import.meta.env.VITE_BACKEND_PORT}`
});

/**
 * Performs an API request using the specified HTTP method, URL, token, and request payload
 * @param {httpMethods} method the HTTP method
 * @param {string} url the URL of the API endpoint
 * @param {string} token the authentication token
 * @param {Object} request the request payload
 * @returns {Promise<any>} promise that resolves to the API response data
 * @throws {Error} error if the API request fails
 */
const apiRequest = async (method: httpMethods, url: string, token: string, request: Object): Promise<any> => {
    const headers = {
        Authorization: `Bearer ${token}`
    };
    //using the axios instance to perform the request that received from each http method
    try {
        const res = await axiosAPI({
            method,
            url,
            data: request,
            headers
        });
        return await Promise.resolve(res.data);
    } catch (err) {
        return await Promise.reject(err);
    }
};

/**
 * Performs a GET request to the specified URL with optional authentication and request payload
 */
const get = (url: string, auth?: string, request?: string) => apiRequest("get", url, auth, request);

/**
 * Performs a DELETE request to the specified URL with optional authentication and request payload
 */
const deleteRequest = (url: string, auth?: string, request?: Object) => apiRequest("delete", url, auth, request);

/**
 * Performs a POST request to the specified URL with optional authentication and request string
 */
const post = (url: string, auth?: string, request?: string) => apiRequest("post", url, auth, request);

/**
 * Performs a PUT request to the specified URL with optional authentication and request payload
 */
const put = (url: string, auth?: string, request?: Object) => apiRequest("put", url, auth, request);

/**
 * Performs a PATCH request to the specified URL with optional authentication and request payload
 */
const patch = (url: string, auth?: string, request?: Object) => apiRequest("patch", url, auth, request);

const API = {
    get,
    delete: deleteRequest,
    post,
    put,
    patch
};
export default API;