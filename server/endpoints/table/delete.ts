import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter, isDateInPast } from "../../utils/utils";
const { isValidLocationData, isValidtableReservationData, isValidDate } = require('../../src/validation');
const { tableReservationModel } = require('../../src/models');

/**
 * Endpoint for deleting a table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const deleteTableHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
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

    if (req.body.permanent?.weekdays?.length) {
        removePermanentDate(req, res, next, user);
        return;
    }

    if (!req.body.reservedForDate) {
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

    removeDate(req, res, next, user);
};


/**
 * Endpoint for removing a table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
const removeDate = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let tableId: number = req.body.tableId;
    let dateString = req.body.reservedForDate;
    let date = new Date(dateString);

    const queryUserTableReservation: {
        location: string;
        userId: string;
        $or: any;
        tableId: number;
    } = {
        location: capitalizeFirstLetter(user.city),
        userId: user.userId,
        tableId: tableId,
        $or: [{ reservedForDate: dateString }, {
            $and: [{
                excludeDates: { $nin: [dateString] }
            },
            {
                "permanent.weekdays": { $in: [date.getDay()] }
            }],  //if day is included
        }]
    };

    //check if user has generally reserved a table fot the given date
    tableReservationModel.findOne(queryUserTableReservation)
        .sort({ createdAt: -1 }) // desc order
        .exec()
        .then((document: any) => {
            if (document) {
                if (document.permanent) {
                    document.excludeDates.push(dateString);
                    document.save().then(() => {
                        res.sendStatus(200);
                    }).catch(() => {
                        res.sendStatus(500);
                    });
                } else {
                    tableReservationModel.deleteOne(queryUserTableReservation).then(() => {
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

/**
 * Endpoint for removing a permanent table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
const removePermanentDate = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let weekdays: number[] = req.body.permanent.weekdays;
    let floor: number = req.body.floor;
    let userId: string = req.body.userId;
    let tableId: number = req.body.tableId;
    let dateString = req.body.reservedForDate;
    let weekday = new Date(dateString).getDay();

    if (!weekdays.includes(weekday)) {
        res.sendStatus(400);
        return
    }

    const query: {
        location: string;
        floor: number,
        userId: string,
        tableId: number,
        "permanent.weekdays": any
    } = {
        location: capitalizeFirstLetter(user.city),
        floor,
        userId,
        tableId,
        "permanent.weekdays": { $all: weekdays }
    };

    tableReservationModel.findOne(query)
        .then((document: any) => {
            if (document) {
                if (document.permanent.weekdays.length === weekdays.length && document.permanent.weekdays.every((value: number) => weekdays.includes(value))) {
                    tableReservationModel.deleteOne(query).then(() => {
                        res.sendStatus(200);
                    }).catch(() => {
                        res.sendStatus(500);
                    });
                } else {
                    document.permanent.weekdays = document.permanent.weekdays.filter((wf: any) => !weekdays.includes(wf));
                    document.save().then(() => {
                        res.sendStatus(200);
                    }).catch(() => {
                        res.sendStatus(500);
                    });
                }
            }
        }).catch(() => {
            res.sendStatus(400);
        })
}