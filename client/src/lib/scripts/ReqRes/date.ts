import API from "./Api";

/**
 * Retrieves the date details for the specified floor and date string
 * @param {number} floor the floor number
 * @param {string} dateString the date string
 * @returns {Promise<any>} promise that resolves to the date details
 * @throws {Error} error if the API request fails.
 */
export const getDateDetails = async (floor: number, dateString: string): Promise<any> => {
    try {
        const response = await API.get(`/location/${floor}/${dateString}`);
        return response;
    } catch (error) {
        console.error(error);
    }
};