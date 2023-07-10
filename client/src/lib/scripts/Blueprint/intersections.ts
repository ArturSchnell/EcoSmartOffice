import * as utils from './utils';
import { lines, origin } from '../stores.js';
import { get } from 'svelte/store';
import { Point, Line, Rect } from './surfaces';
import type { intersectionObject, relevantIntersectionObject } from '../Types/types';

/**
 * Autor: Bogdan Alexandru Militaru
 * Link: https://dev.to/boobo94/how-to-verify-if-point-of-coordinates-is-inside-polygon-javascript-10n6
 * 
 * Note: This code has been adapted 
 * Checks if a point is inside a polygon using the ray-casting algorithm
 * @param {Point} point the Point object to check
 * @param {Point[]} polygon array of Point objects representing the polygon
 * @returns {boolean} true if the point is inside the polygon, false otherwise
 */
const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        //allow same points
        if ((xi === point.x && yi === point.y) || (xj === point.x && yj === point.y)) {
            return true;
        }

        //Check if the horizontal line intersects or crosses the edge
        const intersect = ((yi >= point.y) !== (yj >= point.y)) && (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);

        if (intersect) {
            isInside = !isInside;
        }
    }

    return isInside;
}

/**
 * Checks if one polygon is completely inside another polygon
 * @param {Point[]} polygon1 array of Point objects representing the vertices of the first polygon
 * @param {Point[]} polygon2 array of Point objects representing the vertices of the second polygon
 * @returns {boolean} true if polygon1 is completely inside polygon2, false otherwise
 */
export const isPolygonInPolygon = (polygon1: Point[], polygon2: Point[]): boolean => {
    let isInside = true;
    for (let i = 0; i < polygon1.length; i++) {
        if (!isPointInPolygon(polygon1[i], polygon2)) {
            return false
        }
    }
    return isInside;
};

/**
 * Autor: Paul Bourke
 * Link: http://paulbourke.net/geometry/pointlineplane/javascript.txt
 * 
 * Note: This code has been adapted 
 * Determine the intersection point of two line segments
 * @param {Line} line line object representing the first line
 * @param {Line} currentLine line object representing the second line
 * @returns {Point | false} point object representing the intersection point if the lines intersect, false otherwise
 */
const intersect = (line: Line, currentLine: Line): Point | false => {
    if ((line.start.point.x === line.end.point.x && line.start.point.y === line.end.point.y) || (currentLine.start.point.x === currentLine.end.point.x && currentLine.start.point.y === currentLine.end.point.y)) {
        return false;
    }

    let denominator = (currentLine.end.point.y - currentLine.start.point.y) * (line.end.point.x - line.start.point.x) - (currentLine.end.point.x - currentLine.start.point.x) * (line.end.point.y - line.start.point.y);

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    let ua = ((currentLine.end.point.x - currentLine.start.point.x) * (line.start.point.y - currentLine.start.point.y) - (currentLine.end.point.y - currentLine.start.point.y) * (line.start.point.x - currentLine.start.point.x)) / denominator;
    let ub = ((line.end.point.x - line.start.point.x) * (line.start.point.y - currentLine.start.point.y) - (line.end.point.y - line.start.point.y) * (line.start.point.x - currentLine.start.point.x)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return Circle with the x and y coordinates of the intersection
    let x = line.start.point.x + ua * (line.end.point.x - line.start.point.x);
    let y = line.start.point.y + ua * (line.end.point.y - line.start.point.y);

    return new Point(x, y);
}

/**
 * Calculates the Euclidean distance between two points
 * @param {Point} p1 point object representing the first point
 * @param {Point} p2 point object representing the second point
 * @returns {number} the distance between the two points
 */
const calculatePointToPointDistance = (p1: Point, p2: Point): number => {
    return utils.round10(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
}

/**
 * Determines all intersection objects between the given line and other lines
 * @param {Line} currentLine line object representing the current line
 * @returns {Array<intersectionObject>} array of intersection objects containing the intersecting line and the intersection point
 */
const determineAllIntersectionObjects = (currentLine: Line): Array<intersectionObject> => {
    let intersections: Array<intersectionObject> = [];
    get(lines).forEach((line: Line) => {
        if (line != currentLine) {
            let point = intersect(line, currentLine);
            if (point) {
                intersections.push({ line, point });
            }
        }
    });
    return intersections;
}

/**
 * Determines the relevant intersection objects for the given line
 * @param {Line} currentLine line object representing the current line
 * @returns {relevantIntersectionObject} relevantIntersectionObject containing the relevant intersection objects (start and/or end) for the line
 */
export const determineIntersectionObject = (currentLine: Line): relevantIntersectionObject => {
    if (get(lines).length == 0) return;

    let distance: number = Infinity;
    let relevantIntersectionObj: relevantIntersectionObject = {};

    const allIntersections: Array<intersectionObject> = determineAllIntersectionObjects(currentLine);

    allIntersections.forEach((intersection) => {
        let tempDist: number = calculatePointToPointDistance(currentLine.start.point, intersection.point);
        if (tempDist < distance) {
            //interception at start
            if (tempDist == 0) {
                relevantIntersectionObj.start = {
                    point: intersection.point,
                    line: intersection.line
                }
                return;
            }
            distance = tempDist;
            relevantIntersectionObj.end = {
                point: intersection.point,
                line: intersection.line
            }
        }
    });

    return relevantIntersectionObj;
}

/**
 * Get the rotated rectangle points based on its transformation matrix
 * @param {Rect} rect rect object representing the rectangle
 * @returns {{ x: number, y: number }[]} array of Point objects representing the updated corner positions of the rotated rectangle
 */
export function getRotatedRectPoints(rect: Rect): { x: number, y: number }[] {
    // Given matrix
    var matrix = rect.rectSVG.getCTM();

    // Rectangle corners
    var corners = [
        { x: rect.point.x, y: rect.point.y },                            // top-left corner
        { x: rect.point.x + rect.width, y: rect.point.y },               // top-right corner
        { x: rect.point.x + rect.width, y: rect.point.y + rect.height }, // bottom-right corner
        { x: rect.point.x, y: rect.point.y + rect.height }               // bottom-left corner
    ];

    // Calculate the updated positions of all corners
    var updatedCorners = corners.map(function (corner) {
        var newX = (matrix.a * corner.x) + (matrix.c * corner.y) + matrix.e - get(origin).x;
        var newY = (matrix.b * corner.x) + (matrix.d * corner.y) + matrix.f - get(origin).y;
        return { x: newX, y: newY };
    });

    return updatedCorners;
}

/**
 * Checks if a line intersects with a rectangle
 * @param {Point[]} rectPoints array of Point objects representing the vertices of the rectangle
 * @param {Point} lineStartPoint point object representing the start point of the line
 * @param {Point} lineEndPoint point object representing the end point of the line
 * @returns {boolean} true if the line intersects with the rectangle, false otherwise
 */
export function isLineRectangleCollision(rectPoints: Point[], lineStartPoint: Point, lineEndPoint: Point): boolean {
    for (let i = 0; i < rectPoints.length; i++) {
        const rectStart = rectPoints[i];
        const rectEnd = rectPoints[(i + 1) % rectPoints.length];
        if (intersect(new Line(lineStartPoint.x, lineStartPoint.y, lineEndPoint.x, lineEndPoint.y, false), new Line(rectStart.x, rectStart.y, rectEnd.x, rectEnd.y, false))) {
            return true; // Line and rectangle intersect
        }
    }

    // Line and rectangle do not intersect
    return false;
}

/**
 * Checks if two polygons intersect
 * @param {Point[]} polygon1Points array of Point objects representing the vertices of the first polygon
 * @param {Point[]} polygon2Points array of Point objects representing the vertices of the second polygon
 * @returns {boolean} true if the polygons intersect, false otherwise
 */
export function doPolygonsIntersect(polygon1Points: Point[], polygon2Points: Point[]): boolean {
    for (let i = 0; i < polygon1Points.length; i++) {
        const p1 = polygon1Points[i];
        const p2 = polygon1Points[(i + 1) % polygon1Points.length];

        for (let j = 0; j < polygon2Points.length; j++) {
            const p3 = polygon2Points[j];
            const p4 = polygon2Points[(j + 1) % polygon2Points.length];

            if (intersect(new Line(p1.x, p1.y, p2.x, p2.y, false), new Line(p3.x, p3.y, p4.x, p4.y, false))) {
                return true; // intersection
            }
        }
    }

    return false;  // no intersection
}


