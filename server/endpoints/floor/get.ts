import { Request, Response, NextFunction } from "express"
import { capitalizeFirstLetter } from "../../utils/utils";
const { isValidDate } = require('../../src/validation');
const { tableReservationModel } = require('../../src/models');

/**
 * Endpoint for retrieving table availability for a specific floor and date
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @param {any} user the user object
 * @returns {Promise<void>}
 */
export const getFloorDateDetailsHandler = async (req: Request, res: Response, next: NextFunction, user: any): Promise<void> => {
    let location: string = capitalizeFirstLetter(user.city);
    let floor: number = parseInt(req.params.floor);
    let dateString: string = req.params.dateString;
    req.body.location = location;

    if (floor !== undefined && isNaN(floor)) {
        res.sendStatus(400);
        return;
    }

    if (!isValidDate(dateString)) {
        res.sendStatus(400);
        return;
    }


    const queryLocation: { location: string, floor: number } = {
        location: capitalizeFirstLetter(user.city),
        floor,
    };

    let date = new Date(dateString);
    const query = [
        {
            $match: {
                location: capitalizeFirstLetter(user.city),
                floor,
                $or: [
                    { reservedForDate: dateString },
                    {
                        $and: [
                            {
                                excludeDates: { $nin: [dateString] }
                            },
                            {
                                "permanent.weekdays": { $in: [date.getDay()] }
                            }
                        ]
                    }
                ]
            }
        },
        {
            $sort: { createdAt: 1 } // asc order
        },
        {
            $group: {
                _id: "$userId",
                createdAt: { $first: "$createdAt" },
                location: { $first: "$location" },
                tableId: { $first: "$tableId" }
            }
        },
        {
            $set: {
                userId: "$_id" // rename _id to userId
            }
        },
        {
            $unset: "_id" // remove _id from results
        },
        {
            $sort: { createdAt: -1 } // desc order
        },
    ];

    tableReservationModel.aggregate(query)
        .then((reservedTablesOfDate: any) => {
            locationModel
                .findOne(queryLocation)
                .select('-_id structure.rooms.tables.tableId structure.rooms.roomId')
                .then((result: any) => {
                    for (var i = 0; i < result.structure.rooms.length; i++) {
                        var tablesArrayOfRoom = result.structure.rooms[i].tables; // Zugriff auf das "tables"-Array

                        const amount = reservedTablesOfDate.reduce((count: number, item1: any) => {
                            const found = tablesArrayOfRoom.some((item2: any) => item1.tableId === item2.tableId);
                            return count + (found ? 1 : 0);
                        }, 0);

                        for (const item1 of tablesArrayOfRoom) {
                            if (amount > 0) {
                                item1.state = 'Green';
                            }
                            for (const item2 of reservedTablesOfDate) {
                                if (item1.tableId === item2.tableId) { // if reserved
                                    item1.state = 'Occupied';
                                    item1.isItMe = item2.userId === user.userId;
                                    item1.userId = item2.userId;
                                }
                            };
                        };

                    }
                    let flattenedTables = result.structure.rooms.flatMap((room: any) => room.tables.filter(((table: any) => table.state !== undefined)))
                    res.json(flattenedTables);
                })
                .catch(() => {
                    res.sendStatus(500);
                });
        }).catch(() => {
            res.sendStatus(500);
        });
};