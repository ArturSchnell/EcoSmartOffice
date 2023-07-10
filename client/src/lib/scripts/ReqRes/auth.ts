import API from "./Api";

/**
 * Retrieves the authentication details using the provided token
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the authentication details
 * @throws {Error} error if the API request fails
 */
export const getAuthDetails = async (token: string): Promise<any> => {
    try {
        const response = await API.get(`/auth`, token);
        return response;
    } catch (error) {
        console.error(error);
    }
};