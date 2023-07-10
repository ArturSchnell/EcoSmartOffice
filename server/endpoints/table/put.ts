import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter, isDateInPast } from "../../utils/utils";
const { isValidLocationData, isValidtableReservationData, isValidDate } = require('../../src/validation');
const { tableReservationModel } = require('../../src/models');

/**
 * Endpoint to create a table reservation
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const putTableHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
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

    if (req.body.permanent) {
        if (!req.body.permanent.weekdays || !req.body.permanent.weekdays.length) {
            res.sendStatus(400);
            return;
        }

        reservePermanentDate(req, res, next, user);
        return;
    }

    reserveSingleDate(req, res, next, user);
};

/**
 * Endpoint to reserve a single date for a table
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
const reserveSingleDate = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
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
        res.status(400).send('Tag bereits verbucht');
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
            }],  //if day is included
        }]
    };

    //check if user has generally reserved a table for the given date
    let hasUserReservedTableForDate = await tableReservationModel
        .findOne(queryUserTableReservation)
        .sort({ createdAt: 1 })
        .select('-_id tableId userId permanent')

    if (hasUserReservedTableForDate) {
        res.status(400).send('Du hats bereits an diesem Tag gebucht');
        return;
    }

    new tableReservationModel({
        location: req.body.location,
        tableId: tableId,
        floor: req.body.floor,
        createdAt: Date.now(),
        userId: user.userId,
        reservedForDate: dateString,
    }).save().then(() => {
        res.sendStatus(200)
    }).catch(() => {
        res.sendStatus(500)
    });
}

/**
 * Endpoint to reserve a permanent date for a table
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
const reservePermanentDate = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let tableId: number = req.body.tableId;
    let weekdays = req.body.permanent.weekdays;
    let dateString = req.body.reservedForDate;
    let weekday = new Date(dateString).getDay();

    if (!weekdays.includes(weekday)) {
        res.sendStatus(400);
        return
    }
    //check if table reserved for the given permanent weekdays
    const queryTableReservationPermanent: {
        location: string;
        tableId: number;
        "permanent.weekdays": any;
    } = {
        location: capitalizeFirstLetter(user.city),
        tableId,
        "permanent.weekdays": { $in: weekdays }
    };

    let tableReservedPermanent = await tableReservationModel
        .findOne(queryTableReservationPermanent)

    if (tableReservedPermanent) {
        res.sendStatus(400);
        return
    }

    const queryUserPermanentTableReservation: {
        location: string;
        userId: string;
        "permanent.weekdays": any;
    } = {
        location: capitalizeFirstLetter(user.city),
        userId: user.userId,
        "permanent.weekdays": { $in: weekdays }
    };

    let reservedUserPermanentDates = await tableReservationModel
        .findOne(queryUserPermanentTableReservation)

    if (reservedUserPermanentDates) {
        res.sendStatus(400);
        return
    }

    const filter = { tableId: tableId, userId: user.userId, location: capitalizeFirstLetter(user.city), floor: req.body.floor };
    const update = {
        $set: { createdAt: Date.now() },
        $push: { 'permanent.weekdays': { $each: weekdays } }
    };
    const options = { new: true, upsert: true };

    tableReservationModel.findOneAndUpdate(filter, update, options).then(() => {
        res.sendStatus(200);
    }).catch(() => {
        res.sendStatus(500);
    })
}

module.exports = {
    putTableHandler
};