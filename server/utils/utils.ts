/**
 * Capitalizes the first letter of a string
 * @param {string} string the input string to capitalize
 * @returns {string} the input string with the first letter capitalized
 */
export const capitalizeFirstLetter = (string: string): string => {
    const lowercaseStr = string.toLowerCase();
    return lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1);
}

/**
 * Checks if a date is in the past
 * @param {string} dateString the date string to check
 * @returns {boolean} true if the date is in the past, false otherwise
 */
export const isDateInPast = (dateString: string): boolean => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateString);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < currentDate;
};