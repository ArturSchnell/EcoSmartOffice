import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter } from "../../utils/utils";
const { locationModel } = require('../../src/models');


/**
 * Endpoint for retrieving location details for a specific floor
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const getLocationFloorHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let floor: number | undefined = parseInt(req.params.floor) || undefined;

    if (floor !== undefined && isNaN(floor)) {
        res.sendStatus(400);
        return;
    }

    const query: { location: string, floor?: number | undefined } = {
        location: capitalizeFirstLetter(user.city),
        floor: floor !== undefined ? floor : 1
    };

    locationModel
        .findOne(query)
        .select('-_id floor structure')
        .then((result: any) => {
            if (!result) {
                res.sendStatus(404);
                return;
            }
            res.json(result);
        })
        .catch(() => {
            res.sendStatus(500);
        });
};

/**
 * Endpoint to retrieve the floor count for a location
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {user} user the user object
 * @returns {Promise<void>}
 */
export const getLocationFloorCountHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    const query: { location: string } = {
        location: capitalizeFirstLetter(user.city)
    };

    locationModel.countDocuments(query)
        .then((count: number) => {
            if (count === 0) {
                res.json(1);
            } else {
                res.json(count);
            }
        }).catch(() => {
            res.sendStatus(500);
        });
};