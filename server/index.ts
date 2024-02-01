import { callMSGraph, graphConfig } from "./src/graph";
import { backgroundTask } from "./src/regulator";
import { Request, Response, NextFunction } from "express"
import { User } from "./src/types";
import { putTableHandler } from "./endpoints/table/put";
import { patchTableHandler } from "./endpoints/table/patch";
import { deleteTableHandler } from "./endpoints/table/delete";
import { getLocationFloorCountHandler, getLocationFloorHandler } from "./endpoints/location/get";
import { getTableDateDetailsHandler } from "./endpoints/table/get";
import { putLocationHandler } from "./endpoints/location/put";
import { getFloorDateDetailsHandler } from "./endpoints/floor/get";
require('dotenv').config();
const cron = require('node-cron');
const PORT = process.env.BACKEND_SERVER_PORT || 4000;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const app = express();

const user: User = {
    city: '',
    firstname: '',
    lastname: '',
    userId: '',
};
let isAdmin: boolean = false;
let isLoggedIn: boolean = false;
let token: string;

// Middleware
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.BACKEND_FRONTEND_URL, credentials: true }));

/**
 * Starts the server and connects to MongoDB database.
 * @param {number} PORT the port number on which the server will listen.
 * @returns {void}
 */
app.listen(PORT || 4000, (): void => {
    console.info('Started Server')
    const mongoDBUri = `mongodb://${process.env.MONGODB_USERNAME || 'root'}:${process.env.MONGODB_PASSWORD || 'password'}@${process.env.MONGODB_ADDRESS || 'localhost'}:${process.env.MONGODB_PORT || '27017'}/${process.env.MONGODB_DATABASE || 'EcoSmartOffice'}?authSource=admin`;
    console.info('try:', mongoDBUri);
    mongoose.connect(mongoDBUri, { useNewUrlParser: true }).then((response: any) => {
        console.info(`Connected to MongoDB and server started on PORT ${PORT}`);
    }).catch((err: any) => {
        console.error(err);
    })
});

/**
 * Checks if the user has permission based on the isAdmin flag
 * @returns {boolean} true if the user has permission, false otherwise
 */
export const hasPermission = (): boolean => {
    /**
     * TODO: Logic for admin rights in connection with Azure Groups 
     * Needs arrangements for implementation. 
     */
    return true;
}

const hour = process.env.BACKEND_CRONJOB_HOUR || '22';
const dayOfWeek = process.env.BACKEND_CRONJOB_DAY_OF_WEEK || '*';

cron.schedule(`0 ${hour} * * ${dayOfWeek}`, () => {
    backgroundTask();
});

/**
 * Global authentication and authorization
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next middleware function
 * @returns {Promise<void>}
 */
app.all('*', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.sendStatus(401);
        return;
    }
    token = authHeader.split(' ')[1];

    if (req.cookies?.userAuth) {
        let auth;
        try {
            auth = jwt.verify(req.cookies.userAuth, process.env.BACKEND_JWT_SECRET);
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {

            }
        }

        if (auth !== undefined) {
            user.city = auth.user.city;
            user.firstname = auth.user.forename;
            user.lastname = auth.user.lastname;
            user.userId = auth.user.userId;
        }
    } else {
        try {
            await callMSGraph(graphConfig.graphMeEndpoint, token).then(resp => {
                user.city = resp.city;
                user.firstname = resp.givenName;
                user.lastname = resp.surname;
                user.userId = resp.id;

                const jwtToken = jwt.sign({ user }, process.env.BACKEND_JWT_SECRET, { algorithm: "HS256" })
                res.cookie("userAuth", jwtToken, { httpOnly: true, secure: true, sameSite: 'strict' });
            })
        } catch (error) {
            res.sendStatus(500);
            return
        };
    }

    if (user) {
        isLoggedIn = true;
        isAdmin = hasPermission();
        next();
    } else {
        res.sendStatus(500);
    }
})

/**
 * Endpoint to check if the EcoSmartOffice server is up
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @returns {Promise<void>}
 */
app.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.send('EcoSmartOffice is up!');
})

/**
 * Endpoint for retrieving authentication and autorisation state
 * @async
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {NextFunction} next the next function
 * @returns {Promise<void>}
 */
app.get("/auth", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const state = {
        isAdmin,
        isLoggedIn,
    }

    res.json(state);
});

/**
 * Endpoint to retrieve the floor count for a location
 */
app.get("/location/floorCount", async (req: Request, res: Response, next: NextFunction) => getLocationFloorCountHandler(req, res, next, user));

/**
 * Endpoint to create a table reservation
 */
app.put("/table", async (req: Request, res: Response, next: NextFunction) => putTableHandler(req, res, next, user));

/**
 * Endpoint for updating a table reservation
 */
app.patch("/table", async (req: Request, res: Response, next: NextFunction) => patchTableHandler(req, res, next, user));

/**
 * Endpoint for deleting a table reservation
 */
app.delete("/table", async (req: Request, res: Response, next: NextFunction) => deleteTableHandler(req, res, next, user));

/**
 * Endpoint for retrieving table reservation details for a specific table and date
 */
app.get("/table/:tableId/:dateString(\\d{4}-\\d{2}-\\d{2})", async (req: Request, res: Response, next: NextFunction) => getTableDateDetailsHandler(req, res, next, user));

/**
 * Endpoint for retrieving table availability for a specific floor and date
 */
app.get("/floor/:floor/:dateString(\\d{4}-\\d{2}-\\d{2})", async (req: Request, res: Response, next: NextFunction) => getFloorDateDetailsHandler(req, res, next, user));

/**
 * Endpoint for retrieving location details for a specific floor
 */
app.get("/location/:floor", async (req: Request, res: Response, next: NextFunction) => getLocationFloorHandler(req, res, next, user));

/**
 * Endpoint for creating/updating a location
 */
app.put("/location", async (req: Request, res: Response, next: NextFunction) => putLocationHandler(req, res, next, user));