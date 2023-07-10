import API from "./Api";

/**
 * Create table reservation with the provided details object using the provided authentication token
 * @param {Object} putTableDetails the table reservation details object
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the updated table reservation details
 * @throws {Error} error if the API request fails
 */
export const putTableReservation = async (putTableDetails: Object, token: string): Promise<any> => {
    try {
        const response = await API.put(`/table`, token, putTableDetails);
        return response;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Updates specific properties of the table reservation details with the provided details object using the provided authentication token
 * @param {Object} putTableDetails the table reservation details object containing the properties to be updated
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the updated table reservation details
 * @throws {Error} error if the API request fails
 */
export const patchTableReservation = async (putTableDetails: Object, token: string): Promise<any> => {
    try {
        const response = await API.patch(`/table`, token, putTableDetails);
        return response;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Deletes the table reservation with the provided details object using the provided authentication token
 * @param {Object} putTableDetails the table reservation details object identifying the reservation to be deleted
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the result of the deletion operation
 * @throws {Error } error if the API request fails
 */
export const deleteTableReservation = async (putTableDetails: Object, token: string): Promise<any> => {
    try {
        const response = await API.delete(`/table`, token, putTableDetails);
        return response;
    } catch (error) {
        console.error(error);
    }
};