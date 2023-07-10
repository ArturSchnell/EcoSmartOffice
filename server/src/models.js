const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomsSchema = new Schema({
    area: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date, default: Date.now,
        required: true
    },
    isDirectChild: {
        type: Boolean,
        required: true
    },
    lines: [
        {
            start: {
                point: {
                    x: { type: Number, required: true },
                    y: { type: Number, required: true }
                },
                r: { type: Number, required: true },
            },
            end: {
                point: {
                    x: { type: Number, required: true },
                    y: { type: Number, required: true }
                },
                r: { type: Number, required: true },
            },
            text: {
                content: { type: String, required: true },
            }
        }
    ],
    points: [
        {
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        }
    ],
    roomId: {
        type: Number,
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
    roomNameTextelement: {},
    roomNumber: {
        type: Number,
        required: true
    },
    roomsInside: [this],
    tables: []
});

const locationSchema = new Schema({
    location: { type: String, required: true },
    floor: { type: Number },
    structure: {
        edges: [[{ type: Number, required: true }, { type: Number, required: true }]],
        rooms: [{
            type: roomsSchema,
            ref: 'RoomsModel',
            required: true
        }],
        nodes: [{
            point: {
                x: { type: Number, required: true },
                y: { type: Number, required: true }
            },
        }]
    }
});

const tableReservationSchema = new Schema({
    location: { type: String, required: true },
    floor: { type: Number, required: true },
    tableId: { type: Number, required: true },
    reservedForDate: {
        type: String,
        required: function () {
            return !this.permanent;
        }
    },
    createdAt: {
        type: Date, default: Date.now,
        required: true
    },
    permanent: {
        type: {
            weekdays: {
                type: [{
                    type: Number,
                    min: 0,
                    max: 6,
                    required: false
                }],
                default: undefined
            },
        },
        default: undefined
    },
    excludeDates: [{ type: String, required: false }],
    userId: { type: String, required: true }
});

const locationModel = mongoose.model('LocationModel', locationSchema);
const tableReservationModel = mongoose.model('TableReservationModel', tableReservationSchema);

module.exports = {
    locationModel,
    tableReservationModel,
};