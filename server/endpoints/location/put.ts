import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter } from "../../utils/utils";
import { hasPermission } from "../..";
const { isValidLocationData } = require('../../src/validation');
const { locationModel } = require('../../src/models');

/**
 * Endpoint for creating/updating a location
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const putLocationHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let location: string = capitalizeFirstLetter(user.city);
    let floor: number = req.body.floor ?? 1;
    req.body.location = location;

    if (!hasPermission()) {
        res.sendStatus(403);
        return;
    }

    if (!isValidLocationData(req.body)) {
        res.sendStatus(400);
        return;
    }


    const query = { location, floor };
    const update = { $set: req.body };
    const options = { new: true, upsert: true };

    await locationModel
        .findOneAndUpdate(query, update, options)
        .then(() => {
            res.sendStatus(200);
        }).catch(() => {
            res.sendStatus(500);
        })
};