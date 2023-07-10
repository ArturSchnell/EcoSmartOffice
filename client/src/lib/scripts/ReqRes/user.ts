import axios from "axios";

/**
 * Retrieves the user data for the specified user ID using the provided authentication token
 * @param {string} userId the ID of the user
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the user data
 * @throws {Error } error if the API request fails
 */
export const getUserData = async (userId: string, token: string): Promise<any> => {
    const headers = {
        Authorization: `Bearer ${token}`
    };
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}`, { headers });
        return response;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Retrieves the user image for the specified user ID using the provided authentication token
 * @param {string} userId the ID of the user
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the user image
 * @throws {Error } error if the API request fails
 */
export const getUserImage = async (userId: string, token: string): Promise<any> => {
    try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        })
        return response;
    } catch (error) {
        console.error(error);
    }
};

