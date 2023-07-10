<script lang="ts">
    import { lines, svgEl, zoomScale } from '../stores';
    import { mapLinesToRooms } from './Room.svelte';
    import { DFS } from './DFS';
    import { determineIntersectionObject } from './intersections';
    import { Line, Point, SVGClass, isIdenticalPoint } from './surfaces';
    import { isObjEmpty } from './utils';
    import type { relevantIntersectionObject } from '../Types/types';

    const newLine = new Line(0, 0, 0, 0, false);

    const linesToDivide: Array<[Line, Point]> = new Array();
    let intersections: relevantIntersectionObject;
    let isDrawing = false;

    /**
     * Initializes a new line based on the mouse event
     * @param {MouseEvent} e the MouseEvent object
     * @returns {void}
     */
    const initLine = (e: MouseEvent): void => {
        let svgP = SVGClass.getSVGPoint(e);

        newLine.start.point.x = svgP.x;
        newLine.start.point.y = svgP.y;
        newLine.end.point.x = svgP.x;
        newLine.end.point.y = svgP.y;
        newLine.text.content = '';
    };

    /**
     * Handles the mouse move event to update the end point of the line and check for intersections
     * @param {MouseEvent} e the MouseEvent object
     * @returns {void}
     */
    const handleMouseMove = (e: MouseEvent): void => {
        let svgP = SVGClass.getSVGPoint(e);

        newLine.end.point.x = svgP.x;
        newLine.end.point.y = svgP.y;

        intersections = determineIntersectionObject(newLine);
        if (intersections && !isObjEmpty(intersections)) {
            if (intersections.end) {
                newLine.end.point.x = intersections.end.point.x;
                newLine.end.point.y = intersections.end.point.y;
            }
        }
        SVGClass.setWallLength(newLine);
    };

    /**
     * Checks if the start point of the line is identical to the end point.
     * @returns {boolean} true if the start point is identical to the end point, false otherwise.
     */
    const isStartPointEndpoint = (): boolean => {
        return isIdenticalPoint(newLine.start.point, newLine.end.point);
    };

    /**
     * Handles the mouse up event when drawing a line
     * @returns {void}
     */
    const handleMouseUp = (): void => {
        isDrawing = false;
        $svgEl.removeEventListener('mousemove', handleMouseMove);

        if (isStartPointEndpoint() || isLineAlreadyExisting()) {
            return;
        }

        DFS.mapEdges(new Line(newLine.start.point.x, newLine.start.point.y, newLine.end.point.x, newLine.end.point.y));

        checkForLineSplit();
        mapLinesToRooms(DFS.run());
    };

    /**
     * Starts the movement of a line when the mouse is clicked
     * @param {MouseEvent} e the MouseEvent object
     * @returns {void}
     */
    export const startMoveLine = (e: MouseEvent): void => {
        isDrawing = true;
        initLine(e);

        $svgEl.addEventListener('mousemove', handleMouseMove);
        $svgEl.addEventListener('mouseup', handleMouseUp, { once: true });
    };

    /**
     * Splits lines based on the linesToDivide array
     * @returns {void}
     */
    const splitLines = (): void => {
        if (linesToDivide.length === 0) return;

        linesToDivide.forEach((lineToDivide) => {
            new Line(
                lineToDivide[0].start.point.x,
                lineToDivide[0].start.point.y,
                lineToDivide[1].x,
                lineToDivide[1].y
            );
            new Line(lineToDivide[1].x, lineToDivide[1].y, lineToDivide[0].end.point.x, lineToDivide[0].end.point.y);

            DFS.correctAddedPaths(lineToDivide[0], lineToDivide[1]);
            lineToDivide[0].remove();
        });

        resetLinesToDivide();
    };

    /**
     * Checks if the given point is the end point of another line
     * @param {Line} line the line to check against
     * @param {Point} point the point to check
     * @returns {boolean} true if the point is the end point of another line, false otherwise
     */
    const isEndOfAnotherLine = (line: Line, point: Point): boolean => {
        return (
            (line.start.point.x === point.x && line.start.point.y === point.y) ||
            (line.end.point.x === point.x && line.end.point.y === point.y)
        );
    };

    /**
     * Adds a line and a point pair to the list of lines to divide
     * @param {Line} line the line to add
     * @param {Point} point the point to add
     * @return {void}
     */
    const addLineForDividing = (line: any, point: any): void => {
        if (!isEndOfAnotherLine(line, point)) {
            linesToDivide.push([line, point]);
        }
    };

    /**
     * Checks if the new line already exists in the lines array
     * @returns {boolean} true if the line already exists, false otherwise
     */
    export const isLineAlreadyExisting = (): boolean => {
        return $lines.some(
            (element) =>
                element !== newLine &&
                ((isIdenticalPoint(element.start.point, newLine.start.point) &&
                    isIdenticalPoint(element.end.point, newLine.end.point)) ||
                    (isIdenticalPoint(element.start.point, newLine.end.point) &&
                        isIdenticalPoint(element.end.point, newLine.start.point)))
        );
    };

    /**
     * Resets the linesToDivide array by clearing its contents.
     * @returns {void}
     */
    const resetLinesToDivide = (): void => {
        linesToDivide.length = 0;
    };

    /**
     * Checks for line split based on intersection objects
     * If there are intersections and they are not empty, it checks if the start and end intersections
     * contain nodes that do not exist in the DFS. If so, it adds the lines for dividing
     * @returns {void}
     */
    const checkForLineSplit = (): void => {
        if (intersections && !isObjEmpty(intersections)) {
            if (intersections.start) {
                if (!DFS.existNode(intersections.start.point)) {
                    addLineForDividing(intersections.start.line, intersections.start.point);
                }
            }

            if (intersections.end) {
                if (!DFS.existNode(intersections.end.point)) {
                    addLineForDividing(intersections.end.line, intersections.end.point);
                }
            }
            splitLines();
        }
    };
</script>

{#if isDrawing}
    <line
        x1="{newLine.start.point.x}"
        y1="{newLine.start.point.y}"
        x2="{newLine.end.point.x}"
        y2="{newLine.end.point.y}"></line>
    <circle cx="{newLine.start.point.x}" cy="{newLine.start.point.y}" r="3"></circle>
    <circle cx="{newLine.end.point.x}" cy="{newLine.end.point.y}" r="3"></circle>
    <text
        x="{newLine.text.position.x + 5 * $zoomScale}"
        y="{newLine.text.position.y}"
        font-size="{(11 / $zoomScale) * 1.5}px">{newLine.text.content}</text
    >
{/if}

<style>
    line {
        stroke: #3c3c3b;
    }
    text {
        user-select: none;
        pointer-events: none;
    }
</style>
