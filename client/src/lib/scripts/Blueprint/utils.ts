import { get } from 'svelte/store';
import { zoomScale } from '../stores.js';
import * as utils from './utils.js';
import { Point } from './surfaces.js';

/**
 * Rounds the given number to the nearest multiple of 10 based on the current zoom scale
 * @param {number} n the number to be rounded
 * @returns {number} the rounded number
 */
export const round10 = (n: number): number => {
    return Math.round(n / (10.0 / get(zoomScale))) * (10 / get(zoomScale));
}

/**
 * Calculates the length of a wall in meters based on the given start and end points
 * @param {Point} startPoint the start point of the wall
 * @param {Point} endPoint the end point of the wall
 * @returns {string} the length of the wall in meters, rounded to 2 decimal places
 */
export const calculateWallLengthInMetre = (startPoint: Point, endPoint: Point): string => {
    return (
        Math.round(
            Math.sqrt(
                Math.pow(utils.round10(endPoint.x) - utils.round10(startPoint.x), 2) +
                Math.pow(utils.round10(endPoint.y) - utils.round10(startPoint.y), 2)
            )
        ) / 50
    ).toFixed(2);
}

/**
 * Calculates the center point between two points
 * @param {Point} pt1 the first point
 * @param {Point} pt2 the second point
 * @returns {Point} the center point between pt1 and pt2
 */
export const calculateCentrePoint = (pt1: Point, pt2: Point): Point => {
    return new Point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
}

/**
 * Checks if an object is empty (has no own enumerable properties)
 * @param {any} obj the object to check
 * @returns {boolean} true if the object is empty, false otherwise
 */
export const isObjEmpty = (obj: any): boolean => {
    return Object.keys(obj).length === 0;
}

/**
 * Creates a unique identifier by generating a random number based on the current timestamp
 * @returns {number} unique identifier
 */
export const createUniqueIdentifier = (): number => {
    return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
}