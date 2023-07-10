import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter } from "../../utils/utils";
const { isValidDate } = require('../../src/validation');
const { tableReservationModel } = require('../../src/models');

/**
 * Endpoint for retrieving table reservation details for a specific table and date
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const getTableDateDetailsHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let location: string = capitalizeFirstLetter(user.city);
    let dateString: string = req.params.dateString;
    let tableId: number = parseInt(req.params.tableId);
    req.body.location = location;

    if (tableId !== undefined && isNaN(tableId)) {
        res.sendStatus(400);
        return;
    }

    if (!isValidDate(dateString)) {
        res.sendStatus(400);
        return;
    }

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

    let reservedObj: any = {
        hasUserAlreadyReservedTableToday: false,
        isSelectedTableReserved: false,
    }

    //check if a reserved the table for the given date
    let tableReservedThatDay = await tableReservationModel
        .findOne(queryTableReservationThatDay)
        .sort({ createdAt: 1 })

    reservedObj.isTableReservedByMe = false;
    if (tableReservedThatDay) {
        if (tableReservedThatDay.userId === user.userId) {
            reservedObj.isTableReservedByMe = true
        }
        reservedObj.isSelectedTableReserved = true;
    }


    const queryTableReservationGeneral: {
        location: string;
        tableId: number;
        permanent: any;
    } = {
        location: capitalizeFirstLetter(user.city),
        tableId,
        permanent: { $exists: true },
    };

    let tableReservedGeneral = await tableReservationModel
        .find(queryTableReservationGeneral)
        .select('-_id permanent.weekdays')

    const weekdaysTableReserved = [...new Set(tableReservedGeneral.flatMap((obj: any) => obj.permanent.weekdays))];

    const queryUserPermanentTableReservation: {
        location: string;
        userId: string;
        permanent: any;
    } = {
        location: capitalizeFirstLetter(user.city),
        userId: user.userId,
        permanent: { $exists: true }
    };

    let reservedPermanentDates = await tableReservationModel
        .find(queryUserPermanentTableReservation)
        .select('-_id permanent.weekdays')

    const weekdays = [...new Set(reservedPermanentDates.flatMap((obj: any) => obj.permanent.weekdays))];
    reservedObj.generalPermanentWeekdays = weekdaysTableReserved;
    reservedObj.userPermanentWeekdays = weekdays;

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

    //check if user has generally reserved a table fot the given date
    let hasUserReservedTableForDate = await tableReservationModel
        .findOne(queryUserTableReservation)
        .sort({ createdAt: 1 })
        .select('-_id tableId userId permanent')


    if (hasUserReservedTableForDate) {

        const queryHasUserReallyTableReservation: {
            location: string;
            tableId: number;
            $or: any;
        } = {
            location: capitalizeFirstLetter(user.city),
            tableId: hasUserReservedTableForDate.tableId,
            $or: [{ reservedForDate: dateString }, {
                $and: [{
                    excludeDates: { $nin: [dateString] }
                },
                {
                    "permanent.weekdays": { $in: [date.getDay()] }
                }],  //if day is included
            }]
        };

        let hasUserReallyReservedTableForDate = await tableReservationModel
            .findOne(queryHasUserReallyTableReservation)
            .sort({ createdAt: 1 })
            .select('-_id tableId userId permanent')

        if (hasUserReallyReservedTableForDate) {
            reservedObj.
                hasUserAlreadyReservedTableToday = hasUserReallyReservedTableForDate.userId === user.userId
        }
    }

    if (hasUserReservedTableForDate && tableReservedThatDay) {
        reservedObj.isSameTable = hasUserReservedTableForDate.tableId === tableReservedThatDay.tableId
    }

    if (hasUserReservedTableForDate && tableReservedThatDay) {
        if (hasUserReservedTableForDate.permanent) {
            reservedObj.isPermanent = true;
        }
    }

    res.json(reservedObj);
};