import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter, isDateInPast } from "../../utils/utils";
const { isValidLocationData, isValidtableReservationData, isValidDate } = require('../../src/validation');
const { tableReservationModel } = require('../../src/models');

/**
 * Endpoint for updating a table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const patchTableHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let location: string = capitalizeFirstLetter(user.city);
    let dateString = req.body.reservedForDate;

    req.body.excludeDates = [];
    req.body.floor = req.body.floor ?? 1;
    req.body.userId = user.userId;
    req.body.location = location;

    if (!isValidLocationData(req.body)) {
        res.sendStatus(400);
        return;
    }

    if (!isValidtableReservationData(req.body)) {
        res.sendStatus(400);
        return;
    }

    if (!req.body.reservedForDate && !req.body.permanent) {
        res.sendStatus(400);
        return;
    }

    if (!isValidDate(dateString)) {
        res.sendStatus(400);
        return;
    }

    if (isDateInPast(dateString)) {
        res.sendStatus(400);
        return;
    }

    patchSingleDate(req, res, next, user);
    return;
};

/**
 * Endpoint for updating a single-date table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
const patchSingleDate = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let tableId: number = req.body.tableId;
    let dateString = req.body.reservedForDate;
    let date = new Date(dateString);

    const queryTableReservationThatDay: {
        location: string;
        tableId: number;
        $or: any;
    } = {
        location: capitalizeFirstLetter(user.city),
        tableId,
        $or: [{ reservedForDate: dateString }, {
            $and: [{
                excludeDates: { $nin: [dateString] }
            },
            {
                "permanent.weekdays": { $in: [date.getDay()] }
            }],  //if day is included
        }]
    };

    //check if a reserved the table for the given date
    let tableReservedThatDay = await tableReservationModel
        .findOne(queryTableReservationThatDay)

    if (tableReservedThatDay) {
        res.sendStatus(400);
        return;
    }

    const queryUserTableReservation: {
        location: string;
        userId: string;
        $or: any;
    } = {
        location: capitalizeFirstLetter(user.city),
        userId: user.userId,
        $or: [{ reservedForDate: dateString }, {
            $and: [{
                excludeDates: { $nin: [dateString] }
            },
            {
                "permanent.weekdays": { $in: [date.getDay()] }
            }],
        }]
    };

    //check if user has generally reserved a table fot the given date
    let hasUserReservedTableForDate = await tableReservationModel
        .findOne(queryUserTableReservation)
        .sort({ createdAt: 1 })
        .select('-_id tableId userId permanent')

    if (!hasUserReservedTableForDate) {
        res.sendStatus(400);
        return;
    }

    tableReservationModel.findOne(queryUserTableReservation)
        .sort({ createdAt: -1 }) // desc order
        .exec()
        .then((document: any) => {
            if (document) {
                if (document.permanent) {
                    document.excludeDates.push(dateString);
                    document.save().then(() => {
                        new tableReservationModel({
                            location: req.body.location,
                            tableId: tableId,
                            floor: req.body.floor,
                            createdAt: Date.now(),
                            userId: user.userId,
                            reservedForDate: dateString,
                        }).save().then(() => {
                            res.sendStatus(200);
                        }).catch(() => {
                            res.sendStatus(500);
                        });
                    }).catch(() => {
                        res.sendStatus(500);
                    });
                } else {
                    document.createdAt = new Date();
                    document.tableId = tableId;
                    document.save().then(() => {
                        res.sendStatus(200);
                    }).catch(() => {
                        res.sendStatus(500);
                    });
                }
            }
        }).catch(() => {
            res.sendStatus(500);
        });
}