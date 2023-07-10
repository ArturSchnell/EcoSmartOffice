import axios from "axios";
import { capitalizeFirstLetter } from "../utils/utils";
require('dotenv').config();

const { locationModel, tableReservationModel } = require('./models');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let locations: any;
const Rt = 287.058;
const P = 101325; // pressure
const K = 273.15; // Kelvin
const c = 1.005; //  thermal capacity air
const jToKwhFactor = 3.6e+6; //j to kWh

/**
 * Performs a background task that loads locations, retrieves floors and table reservations for each location,
 * and creates a protocol file for each location
 * @async
 * @returns {Promise<void>} promise that resolves once the background task is completed
 */
export const backgroundTask = async (): Promise<void> => {
    try {
        const config = yaml.load(fs.readFileSync((process.env.BACKEND_LOCATIONS_FILE || 'locations') + '.yml', 'utf8'));
        locations = config.LOCATIONS;
    } catch (e) {
        console.error('LOCATIONS_FILE nicht gefunden')
        return
    }

    if (!locations.length) {
        console.error('Keine LOCATIONS innerhalb der LOCATION_FILE gefunden')
        return;
    }

    for (const location of locations) {
        const floors = await getFloors(location);
        const reservedTables = await getTableReservations(location);
        const reservedTableIds = reservedTables.map((table: any) => table.tableId)

        let date = getDateString(new Date());
        const filePath = `../${process.env.BACKEND_PROTOCOLS_FOLDER_PATH || 'protocols'}/${location.LOCATION || 'UNB-'}-${date}.txt`;
        createProtocolFile(filePath);

        setData(location, floors, reservedTableIds, filePath);
    };
};

/**
 * Creates a protocol file at the specified file path if it doesn't already exist
 * @param {string} filePath the file path of the protocol file to create
 * @returns {void}
 */
const createProtocolFile = (filePath: string): void => {
    const folderPath = path.dirname(filePath);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', { flag: 'wx' });
    }
}

/**
 * Sets data for the specified location, including floor details, reserved table IDs, and protocol file
 * @async
 * @param {any} location the location object containing the details of the location
 * @param {any[]} floors array of floor objects representing the floors in the location
 * @param {any[]} reservedTableIds array of reserved table IDs
 * @param {string} filePath the file path of the protocol file
 * @returns {Promise<void>}
 */
const setData = async (location: any, floors: any, reservedTableIds: any, filePath: string): Promise<void> => {
    const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    for (const floor of floors) {
        writeStream.write(`Etage ${floor.floor}:\n`);
        for (const room of floor.structure.rooms) {
            const result = checkObjects(room.tables, reservedTableIds) || !reservedTableIds.length;
            writeStream.write(`\t${room.roomName}:  [${room.area.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}m²] `);
            const emptyTemp = location.EMPTY_ROOM_TEMP_IN_CELSIUS || 18;
            const defaultTemp = location.DEFAULT_ROOM_TEMP_IN_CELSIUS || 20;
            if (!result) {  // reduce (stay) heat temperature in these rooms
                await setRoomTemperature(room, location, emptyTemp, writeStream);
            } else {        // raise (stay) heat temperature in these rooms
                await setRoomTemperature(room, location, defaultTemp, writeStream);
            }
            writeStream.write(`\n`);
        }
    }
    writeStream.end();
}

/**
 * Sets the temperature for a room in the specified location
 * @async
 * @param {any} room the room object containing the details of the room
 * @param {any} location the location object containing the details of the location
 * @param {number} temperature the desired temperature for the room
 * @param {any} writeStream the write stream for the protocol file
 * @returns {Promise<void>}
 */
const setRoomTemperature = async (room: any, location: any, temperature: number, writeStream: any): Promise<void> => {
    const headers = { headers: { Authorization: `Bearer ${location.HA_BEARER_TOKEN}` } }
    const roomNameEdited = room.roomName.replace(/ /g, "_").toLowerCase();

    const relevantEntities = await getRelevantEntities(location, headers, roomNameEdited);
    for (const entity of relevantEntities) {
        if (entity?.attributes?.temperature !== temperature) {
            const thermalEnergyChange = calculateThermalEnergyChange(room.area, entity?.attributes?.temperature, temperature, location);
            const heatingPower = calculateDifferenceOfHeatingPower(room, entity?.attributes?.temperature, temperature, location);
            writeStream.write(`${(thermalEnergyChange + heatingPower).toFixed(2)}kW gegenüber Vorwert:`);
            writeStream.write(`${entity?.attributes?.temperature}°C ⟶ ${temperature}°C`);
            const postData = {
                entity_id: entity.entity_id,
                temperature,
            };

            await axios.post(`${location.HA_IP}:${location.HA_PORT}/api/services/climate/set_temperature`, postData, headers);
        } else {
            writeStream.write(`Keine Veränderung`);
        }
    }
}

/**
 * Calculates the change in thermal energy for a given area and temperature difference, and converts it to kilowatts (kW) for a half-hour duration
 * @param {number} area the area of the room in square meters
 * @param {number} oldTempInC the old temperature in degrees Celsius
 * @param {number} newTempInC the new temperature in degrees Celsius
 * @param {any} location the location object containing relevant parameters
 * @returns {number} the change in thermal energy in kilowatts (kW) for a half-hour duration
 */
const calculateThermalEnergyChange = (area: number, oldTempInC: number, newTempInC: number, location: any): number => {
    //Q = m * c* ΔT
    const V = area * location.CEILING_HEIGHT_IN_M;
    const deltaT = (oldTempInC - newTempInC);
    const pOld = P / (Rt * (oldTempInC + K));
    const pNew = P / (Rt * (newTempInC + K));
    const p = (pOld + pNew) / 2;
    const m = p * V;

    const Q = (m * c * deltaT)

    return Q / jToKwhFactor / (1000 * 0.5); // ~0.5h duration
}

/**
 * Calculates the difference in heating power required to heat a room from an old temperature to a new temperature
 * @param {any} room the room object containing relevant parameters
 * @param {number} oldTempInC the old temperature in degrees Celsius
 * @param {number} newTempInC the new temperature in degrees Celsius
 * @param {any} location the location object containing relevant parameters
 * @returns {number} The difference in heating power in kilowatts (kW)
 */
const calculateDifferenceOfHeatingPower = (room: any, oldTempInC: number, newTempInC: number, location: any): number => {
    const minRegionTemp = location.MIN_TEMP_REGION_IN_CELSIUS || '-11';

    // Temperature differences
    const DiffOldTemp = oldTempInC - minRegionTemp;
    const DiffNewTemp = newTempInC - minRegionTemp;

    const volume = room.area * location.CEILING_HEIGHT_IN_M;

    const heatingHours = location.HEATING_HOURS || 24;

    // Heating power requirements
    const heatingPowerOldTemp = volume * location.U_VALUE * DiffOldTemp * heatingHours / 1000;  // W to kW
    const heatingPowerNewTemp = volume * location.U_VALUE * DiffNewTemp * heatingHours / 1000;  // W to kW

    return heatingPowerNewTemp - heatingPowerOldTemp;
}

/**
 * Retrieves the relevant entities (climate entities) for a specific room from the Home Assistant API
 * @async
 * @param {any} location the location object containing the Home Assistant IP and port
 * @param {any} headers the headers for the API request
 * @param {string} roomName the name of the room
 * @returns {Promise<any>} array of relevant entities (climate entities) for the specified room
 */
const getRelevantEntities = async (location: any, headers: any, roomName: string): Promise<any> => {
    try {
        const allEntities = await axios.get(`${location.HA_IP}:${location.HA_PORT}/api/states`, headers);
        return allEntities.data.filter((obj: any) => obj.entity_id.includes(`climate.${roomName}`));
    } catch (error: any) {
        return [];
    }
}

/**
 * Converts a Date object to a string in the format "YYYY-MM-DD"
 * @param {Date} date the Date object to convert
 * @returns {string} string representation of the date in the format "YYYY-MM-DD"
 */
const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Checks if any objects in an array have matching IDs from a given ID list
 * @param {any} array the array of objects to check
 * @param {any} idList the list of IDs to compare against
 * @returns {boolean} true if any object in the array has a matching ID, false otherwise
 */
const checkObjects = (array: any, idList: any): boolean => {
    return idList.some((id: any) => array.some((table: any) => table.tableId === id));
}

/**
 * Retrieves the floors data for a given location#
 * @async
 * @param {any} location the location object containing the necessary information
 * @returns {Promise<any>} promise that resolves to the floors data
 */
const getFloors = async (location: any): Promise<any> => {
    const queryRooms: {
        location: string
    } = {
        location: capitalizeFirstLetter(location.LOCATION),
    };
    return locationModel.find(queryRooms);
}

/**
 * Retrieves the table reservations for a given location
 * @async
 * @param {any} location the location object containing the necessary information
 * @returns {Promise<any>} promise that resolves to the table reservations
 */
const getTableReservations = async (location: any): Promise<any> => {
    const currentDate = new Date("2023-06-08");
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    const dateString = getDateString(nextDate);
    let loctionName = location.LOCATION || '';


    const query: {
        location: string;
        $or: any
    } = {
        location: capitalizeFirstLetter(loctionName),
        $or: [{ reservedForDate: dateString }, {
            $and: [{
                excludeDates: { $nin: [dateString] }
            },

            { "permanent.weekdays": { $in: [nextDate.getDay()] } },  //if Day is included
            ]
        }]
    };


    return tableReservationModel.find(query);
}