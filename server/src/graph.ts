import axios from 'axios';

/**
 * Calls the Microsoft Graph API with the specified endpoint and token to retrieve data
 * @async
 * @param {string} endpoint the API endpoint to call
 * @param {string} token the authentication token for accessing the API
 * @returns {Promise<any>} promise that resolves to the response data from the API
 */
export const callMSGraph = async (endpoint: string, token: string): Promise<any> => {
    const response = await axios.get(endpoint, {
        headers: {
            Authorization: token
        }
    });
    return response.data;
}

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/beta/me",
    graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages",
    graphUserEndpoint: "https://graph.microsoft.com/v1.0/users",
};