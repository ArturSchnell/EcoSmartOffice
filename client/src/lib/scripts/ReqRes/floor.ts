import API from "./Api";

/**
 * Retrieves the date details for the specified floor and date string with authentication token
 * @param {number} floor the floor number
 * @param {string} dateString the date string
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the date details
 * @throws {Error} error if the API request fails
 */
export const getDateDetails = async (floor: number, dateString: string, token: string): Promise<any> => {
    try {
        const response = await API.get(`/floor/${floor}/${dateString}`, token);
        return response;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Retrieves the user date details for the specified table ID, date string, and authentication token
 * @param {number} tableId the table ID
 * @param {string} dateString the date string
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the user date details
 * @throws {Error} error if the API request fails
 */
export const getUserDateDetails = async (tableId: number, dateString: string, token: string): Promise<any> => {
    try {
        const response = await API.get(`/table/${tableId}/${dateString}`, token);
        return response;
    } catch (error) {
        console.error(error);
    }
};