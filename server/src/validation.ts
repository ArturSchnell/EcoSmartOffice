const { locationModel, tableReservationModel } = require("./models");

/**
 * Validates the provided data against the locationModel schema
 * @param {any} data the data to be validated
 * @returns {boolean} boolean indicating whether the data is valid according to the locationModel schema
 */
const isValidLocationData = (data: any): boolean => {
    const myModelInstance = new locationModel(data);

    const validationError = myModelInstance.validateSync();
    if (validationError) {
        console.error(validationError)
        return false;
    } else {
        return true;
    }
}

/**
 * Validates the provided data against the tableReservationModel schema
 * @param {any} data the data to be validated
 * @returns {boolean} boolean indicating whether the data is valid according to the tableReservationModel schema
 */
const isValidtableReservationData = (data: any): boolean => {
    const myModelInstance = new tableReservationModel(data);

    const validationError = myModelInstance.validateSync();
    if (validationError) {
        console.error(validationError)
        return false;
    } else {
        return true;
    }
}

/**
 * Validates a date string and checks if it represents a valid date
 * @param {string} dateString The date string to validate in the format 'YYYY-MM-DD'
 * @returns {boolean} true if the date is valid, false otherwise
 */
const isValidDate = (dateString: string): boolean => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);

    const date = new Date(year, month, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day &&
        !isNaN(date.getTime())
    );
}

module.exports = {
    isValidLocationData,
    isValidtableReservationData,
    isValidDate
};