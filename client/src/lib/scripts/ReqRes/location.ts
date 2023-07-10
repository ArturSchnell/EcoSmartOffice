import Api from "./Api";

/**
 * Retrieves the number of floors using the provided authentication token
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the number of floors
 * @throws {Error} error if the API request fails
 */
export const getFloorsAmount = async (token: string): Promise<any> => {
    try {
        const response = await Api.get("/location/floorCount", token);
        return response;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Retrieves the details of a specific floor using the provided floor number and authentication token
 * @param {number} floor the floor number
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the floor details
 * @throws {Error} error if the API request fails
 */
export const getFloorDetails = async (floor: number, token: string): Promise<any> => {
    try {
        const response = await Api.get(`/location/${floor}`, token);
        return response;
    } catch (error) {
        throw error;
    }
};


/**
 * Retrieves the details of tables on a specific floor using the provided authentication token
 * @param {number} floor the floor number
 * @param {number} timestamp the timestamp
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the table details
 * @throws {Error} error if the API request fails
 */
export const getTableDetails = async (floor: number, timestamp: number, token: string): Promise<any> => {
    try {
        const response = await Api.get(`/location/${floor}`, token);
        return response;
    } catch (error) {
        console.error(error);
    }
};


/**
 * Updates the floor details with the provided floor details object using the provided authentication token
 * @param {Object} floorDetails the floor details object
 * @param {string} token the authentication token
 * @returns {Promise<any>} promise that resolves to the updated floor details
 * @throws {Error} error if the API request fails
 */
export const putFloorDetails = async (floorDetails: Object, token: string): Promise<any> => {
    try {
        const response = await Api.put(`/location`, token, floorDetails);
        return response;
    } catch (error) {
        console.error(error);
    }
};


