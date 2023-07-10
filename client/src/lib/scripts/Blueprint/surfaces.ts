import * as utils from './utils';
import { svgEl, lines, origin, zoomScale } from "../stores";
import { get } from "svelte/store";

export const svgLinesCopy: SVGLineElement[] = Array()
export const circles: Circle[] = new Array();
export const texts: Text[] = new Array();

const textElementWidthInPx: number = 50;
const textElementHeightInPx: number = 10;

/**
 * Represents a point in 2D space with x and y coordinates
 */
export class Point {
    x: number;
    y: number;

    /**
      * Constructs a new Point object
      * @param x the x coordinate (default: 0)
      * @param y the y coordinate (default: 0)
      */
    constructor(x: number = 0, y: number = 0) {
        this.x = Math.round(x * 100) / 100;
        this.y = Math.round(y * 100) / 100;
    }
}

/**
 * Utility class for working with SVG elements
 */
export class SVGClass {
    /**
     * Retrieves the SVG point based on the mouse event coordinates
     * @param {MouseEvent} e the MouseEvent object containing the mouse coordinates
     * @returns {DOMPoint} the SVG point corresponding to the mouse coordinates
     */
    static getSVGPoint = (e: MouseEvent): DOMPoint => {
        const pt = get(svgEl).createSVGPoint();
        pt.x = utils.round10(e.clientX - get(origin).x * get(zoomScale));
        pt.y = utils.round10(e.clientY - get(origin).y * get(zoomScale));

        const svgP = pt.matrixTransform(get(svgEl).getScreenCTM().inverse());
        svgP.x = utils.round10(svgP.x);
        svgP.y = utils.round10(svgP.y);

        return svgP;
    }

    /**
     * Sets the wall length for a given Line object
     * @param {Line} currentLine the Line object for which to set the wall length
     * @returns {void}
     */
    static setWallLength = (currentLine: Line): void => {
        let centrePoint = utils.calculateCentrePoint(currentLine.start.point, currentLine.end.point);
        let dist = utils.calculateWallLengthInMetre(currentLine.start.point, currentLine.end.point);

        currentLine.text.content = `${dist}m`;
        currentLine.text.position.x = centrePoint.x - textElementWidthInPx / 2;
        currentLine.text.position.y = centrePoint.y + textElementHeightInPx / 2;
    }
}

/**
 * Represents a rectangular shape with top line, 
 * SVG rectangle element, corner point, width, height, and bottom right point
 */
export class Rect {
    topLine: Line;
    rectSVG: SVGRectElement;
    point: Point
    width: number
    height: number;
    bottomRightPoint: Circle;

    /**
     * Constructs a new Rect object
     * @param x the x coordinate of the top-left corner of the rectangle
     * @param y the y coordinate of the top-left corner of the rectangle
     * @param width the width of the rectangle
     * @param height the height of the rectangle
     */
    constructor(x: number, y: number, width: number, height: number) {
        this.point = new Point(x, y);
        this.width = width;
        this.height = height;

        this.topLine = new Line((x + width / 2), y, (x + width / 2), y - 20, false);
        this.bottomRightPoint = new Circle(x + width, y + height, 3);
    }
}

/**
 * Represents a line with start and end points, text label, and interception lines
 */
export class Line {
    start: Circle;
    end: Circle;
    text: Text;
    interceptionLines: Line[] = undefined;

    /**
     * Constructs a new Line object.
     * @param x1 the x coordinate of the start point (default: x1)
     * @param y1 the y coordinate of the start point (default: y1)
     * @param x2 the x coordinate of the end point (default: x1)
     * @param y2 the y coordinate of the end point (default: y1)
     * @param push flag indicating whether the line should be added to the list of lines (default: true)
     */
    constructor(x1: number, y1: number, x2: number = x1, y2: number = y1, push = true) {
        this.start = new Circle(x1, y1, 3);
        this.end = new Circle(x2, y2, 3);
        this.text = new Text();
        SVGClass.setWallLength(this);
        if (push) {
            lines.update(oldLines => [...oldLines, this]);
        }
    }

    /**
     * Adds the line to the list of lines
     * @returns {void}
     */
    add(): void {
        lines.update(oldLines => [...oldLines, this]);
    }

    /**
     * Removes the line element
     * @returns {void}
     */
    remove(): void {
        this.text.remove();
        this.start.remove();
        this.end.remove();
        removeItem(this, get(lines));
    }
}

/**
 * Represents a circle with a center point and radius
 */
export class Circle {
    static instance = null;
    point: Point;
    r: number;

    /**
     * Constructs a new Circle object
     * @param x the x coordinate of the center point
     * @param y the y coordinate of the center point
     * @param r the radius of the circle (default: 0)
     */
    constructor(x: number, y: number, r: number = 0) {
        this.point = new Point(x, y);
        this.r = r;
    }

    /**
     * Removes the circle element
     * If the circle is not associated with any lines, it is removed from the list of circles
     * @returns {void}
     */
    remove(): void {
        const circleInLines = get(lines).filter(line => line.start === this || line.end === this).length;
        if (circleInLines <= 1) {
            removeItem(this, circles);
        }
    }
}

/**
 * Represents a text element with position and content
 */
class Text {
    position: Point;
    content: string;

    /**
     * Constructs a new Text object
     * @param x the x coordinate of the text position (default: 0)
     * @param y the y coordinate of the text position (default: 0)
     */
    constructor(x: number = 0, y: number = 0) {
        this.position = new Point(x, y);
        texts.push(this);
    }

    /**
     * Removes the text element from the list of texts
     * @returns {void}
     */
    remove(): void {
        removeItem(this, texts);
    }
}

/**
 * Checks if a line already exists in the list of lines
 * @param {Line} line the Line object to check for existence
 * @returns {boolean} true if the line already exists, false otherwise
 */
export const isLineAlreadyExisting = (line: Line): boolean => {
    return get(lines).some((element) =>
        element !== line && (
            (isIdenticalPoint(element.start.point, line.start.point) && isIdenticalPoint(element.end.point, line.end.point))
            ||
            (isIdenticalPoint(element.start.point, line.end.point) && isIdenticalPoint(element.end.point, line.start.point))
        )
    );
}

/**
 * Checks if the start point of a line is the same as the end point
 * @param {Line} line the Line object to check
 * @returns {boolean} true if the start point is the same as the end point, false otherwise
 */
export const isStartPointEndpoint = (line: Line): boolean => {
    return isIdenticalPoint(line.start.point, line.end.point)
}

/**
 * Checks if two points are identical
 * @param {Point} pt1 the first Point object to compare
 * @param {Point} pt2 the second Point object to compare
 * @returns {boolean} true if the points are identical, false otherwise
 */
export const isIdenticalPoint = (pt1: Point, pt2: Point) => {
    return pt1.x === pt2.x && pt1.y === pt2.y
}

/**
 * Removes an item from an array
 * @param {T} item the item to remove
 * @param {T[]} arr array from which to remove the item
 * @returns {void}
 */
const removeItem = <T>(item: T, arr: T[]): void => {
    let index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

