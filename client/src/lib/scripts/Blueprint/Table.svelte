<script context="module" lang="ts">
    /**
     * Creates a new instance of the TableC class
     * @returns {void}
     */
    export function createTable(): void {
        new TableC();
    }

    export class TableC {
        matrix: DOMMatrix;
        tableId: number;
        rect: Rect;
        width: number;
        height: number;
        state: TableState;
        isLoaded: boolean;
        isItMe: boolean;
        userId: string;
        user: User;

        /**
         * Constructs a new TableC object
         * @param {number} [tableId=Date.now()] the ID of the table (default: current timestamp)
         * @param {number} [width=60] the width of the table (default: 60)
         * @param {number} [height=30] the height of the table (default: 30)
         * @param {DOMMatrix} [matrix=new DOMMatrix([1, 0, 0, 1, 100, 100])] the transformation matrix of the table (default: identity matrix with translation)
         * @param {TableState} [state='Available'] the state of the table (default: 'Available')
         * @param {boolean} [isLoaded=false] indicates if the table is loaded (default: false)
         */
        constructor(
            tableId: number = Date.now(),
            width: number = 60,
            height: number = 30,
            matrix: DOMMatrix = new DOMMatrix([1, 0, 0, 1, 100, 100]),
            state: TableState = 'Available',
            isLoaded: boolean = false
        ) {
            this.tableId = tableId;
            this.width = width;
            this.height = height;
            this.rect = new Rect(0, 0, width, height);
            this.matrix = matrix;
            this.state = state;
            this.isLoaded = isLoaded;

            tables.update((existingTables) => [...existingTables, this]);
        }
    }
</script>

<script lang="ts">
    import Modal from '../Modal.svelte';
    import { getUserDateDetails } from '../ReqRes/floor';
    import { getUserData, getUserImage } from '../ReqRes/user';
    import { showAdminPanel, bluePrintMode, svgEl, origin, tables, tokenMSAL, dateString } from '../stores';
    import { checkAndHandleTableInRooms } from './Room.svelte';
    import * as utils from './utils';
    import { Rect, SVGClass } from './surfaces';
    import { BlueprintMode, type TableState, type User } from '../Types/types';
    export let table: TableC;
    let modal: Modal;
    let group: SVGGElement;

    const rotationAngleInDegree = 5.0;
    const ninentyDegreeInRad = 1.57079633;
    const minScale = 0.5;
    const maxScale = 1.5;

    table.state;
    const mutationObject = {
        drag: {
            distX: 0,
            distY: 0,
        },
        rotate: {
            cx: 0,
            cy: 0,
            startRadiant: 0,
            startMatrix: new DOMMatrix(),
        },
        scale: {
            startMatrix: new DOMMatrix(),
            transformedPoint: new DOMPoint(),
        },
    };

    /**
     * Sets the transformation matrix of the table
     * @param {DOMMatrix} matrix the new transformation matrix to set
     * @returns {void}
     */
    const setTableMatrix = (matrix: DOMMatrix): void => {
        table.matrix.a = matrix.a;
        table.matrix.b = matrix.b;
        table.matrix.c = matrix.c;
        table.matrix.d = matrix.d;
        table.matrix.e = matrix.e;
        table.matrix.f = matrix.f;
    };

    /**
     * Starts dragging the table
     * @param {MouseEvent} e the mouse event
     * @returns {void}
     */
    const startDrag = (e: MouseEvent): void => {
        const mouseMove = (e: MouseEvent): void => {
            e.preventDefault();
            e.stopPropagation();

            const svgP = SVGClass.getSVGPoint(e);
            const ctm = table.rect.rectSVG.getCTM();

            const newX = utils.round10(svgP.x + mutationObject.drag.distX - $origin.x);
            const newY = utils.round10(svgP.y + mutationObject.drag.distY - $origin.y);

            const resultMatrix = ctm;
            resultMatrix.e = newX;
            resultMatrix.f = newY;

            setTableMatrix(resultMatrix);

            checkAndHandleTableInRooms(table);
        };

        const mouseUp = (): void => {
            $svgEl.removeEventListener('mouseup', mouseUp);
            $svgEl.removeEventListener('mousemove', mouseMove);
        };

        if ($showAdminPanel && $bluePrintMode === BlueprintMode.Draw) {
            e.preventDefault();
            e.stopPropagation();

            const svgP = SVGClass.getSVGPoint(e);
            const ctm = table.rect.rectSVG.getCTM();
            const point = table.rect.rectSVG.ownerSVGElement.createSVGPoint();

            point.x = table.rect.point.x;
            point.y = table.rect.point.y;

            const transformedPoint = point.matrixTransform(ctm);

            mutationObject.drag.distX = transformedPoint.x - svgP.x;
            mutationObject.drag.distY = transformedPoint.y - svgP.y;

            $svgEl.addEventListener('mousemove', mouseMove);
            $svgEl.addEventListener('mouseup', mouseUp);
        }
    };

    /**
     * Starts rotating the table
     * @param {MouseEvent} e the mouse event
     * @returns {void}
     */
    const startRotate = (e: MouseEvent): void => {
        const mouseUp = (): void => {
            $svgEl.removeEventListener('mouseup', mouseUp);
            $svgEl.removeEventListener('mousemove', mouseMove);
        };

        const mouseMove = (e: MouseEvent): void => {
            e.preventDefault();
            e.stopPropagation();
            const svgP = SVGClass.getSVGPoint(e);
            const rotationMatrix = $svgEl.createSVGMatrix();

            let radiant =
                Math.atan2(
                    svgP.y - mutationObject.rotate.cy + $origin.y,
                    svgP.x - mutationObject.rotate.cx + $origin.x
                ) - mutationObject.rotate.startRadiant;
            const degree = Math.round((radiant * 180) / Math.PI / rotationAngleInDegree) * rotationAngleInDegree;
            radiant = (degree * Math.PI) / 180;

            rotationMatrix.a = Math.cos(radiant);
            rotationMatrix.b = Math.sin(radiant);
            rotationMatrix.c = -Math.sin(radiant);
            rotationMatrix.d = Math.cos(radiant);
            rotationMatrix.e =
                mutationObject.rotate.cx -
                mutationObject.rotate.cx * Math.cos(radiant) +
                mutationObject.rotate.cy * Math.sin(radiant);
            rotationMatrix.f =
                mutationObject.rotate.cy -
                mutationObject.rotate.cx * Math.sin(radiant) -
                mutationObject.rotate.cy * Math.cos(radiant);

            const resultMatrix = rotationMatrix.multiply(mutationObject.rotate.startMatrix);
            resultMatrix.e -= $origin.x;
            resultMatrix.f -= $origin.y;

            setTableMatrix(resultMatrix);

            checkAndHandleTableInRooms(table);
        };

        if ($showAdminPanel && $bluePrintMode === BlueprintMode.Draw) {
            e.preventDefault();
            e.stopPropagation();

            const matrix = table.rect.rectSVG.getCTM();
            const bbox2 = table.rect.rectSVG.getBBox();
            const centerX = bbox2.x + bbox2.width / 2;
            const centerY = bbox2.y + bbox2.height / 2;
            const svgPoint = group.ownerSVGElement.createSVGPoint();

            svgPoint.x = centerX;
            svgPoint.y = centerY;

            const transformedPoint = svgPoint.matrixTransform(matrix);

            mutationObject.rotate.cx = transformedPoint.x;
            mutationObject.rotate.cy = transformedPoint.y;

            mutationObject.rotate.startMatrix = table.rect.rectSVG.getCTM();

            mutationObject.rotate.startRadiant =
                Math.atan2(mutationObject.rotate.startMatrix.b, mutationObject.rotate.startMatrix.a) -
                ninentyDegreeInRad; // minus 90° -> startPoint on top (not right)

            $svgEl.addEventListener('mouseup', mouseUp);
            $svgEl.addEventListener('mousemove', mouseMove);
        }
    };

    /**
     * Starts scaling the table
     * @param {MouseEvent} e the mouse event
     * @returns {void}
     */
    const startScale = (e: MouseEvent): void => {
        const mouseUp = (): void => {
            $svgEl.removeEventListener('mouseup', mouseUp);
            $svgEl.removeEventListener('mousemove', mouseMove);
        };

        const mouseMove = (e: MouseEvent): void => {
            e.preventDefault();
            e.stopPropagation();

            const svgP = SVGClass.getSVGPoint(e);

            let untr = mutationObject.scale.transformedPoint.matrixTransform(
                mutationObject.scale.startMatrix.inverse()
            );
            let trMouse = svgP.matrixTransform(mutationObject.scale.startMatrix.inverse());

            let scaleX = trMouse.x / untr.x;
            let scaleY = trMouse.y / untr.y;

            // Calculate the current scale factor of the mutationObject.scale.matrix
            const currentScaleX = Math.sqrt(
                mutationObject.scale.startMatrix.a * mutationObject.scale.startMatrix.a +
                    mutationObject.scale.startMatrix.b * mutationObject.scale.startMatrix.b
            );
            const currentScaleY = Math.sqrt(
                mutationObject.scale.startMatrix.c * mutationObject.scale.startMatrix.c +
                    mutationObject.scale.startMatrix.d * mutationObject.scale.startMatrix.d
            );

            // Calculate the minimum and maximum scaling factor for scaleX and scaleY
            const minScaleX = minScale / currentScaleX;
            const maxScaleX = maxScale / currentScaleX;
            const minScaleY = minScale / currentScaleY;
            const maxScaleY = maxScale / currentScaleY;

            // Limit the scaleX and scaleY scaling factors to their respective range limits
            scaleX = Math.max(minScaleX, Math.min(maxScaleX, scaleX));
            scaleY = Math.max(minScaleY, Math.min(maxScaleY, scaleY));

            const scaleMatrix = $svgEl.createSVGMatrix();
            scaleMatrix.a = scaleX;
            scaleMatrix.b = 0;
            scaleMatrix.c = 0;
            scaleMatrix.d = scaleY;
            scaleMatrix.e = 0;
            scaleMatrix.f = 0;

            const resultMatrix = mutationObject.scale.startMatrix.multiply(scaleMatrix);

            setTableMatrix(resultMatrix);
            checkAndHandleTableInRooms(table);
        };

        if ($showAdminPanel && $bluePrintMode === BlueprintMode.Draw) {
            e.preventDefault();
            e.stopPropagation();

            mutationObject.scale.startMatrix = table.rect.rectSVG.getCTM();
            const bbox = table.rect.rectSVG.getBBox();

            const rightRectX = bbox.x + bbox.width;
            const bottomRectY = bbox.y + bbox.height;

            const svgPoint = group.ownerSVGElement.createSVGPoint();
            svgPoint.x = rightRectX;
            svgPoint.y = bottomRectY;

            mutationObject.scale.startMatrix.e -= $origin.x;
            mutationObject.scale.startMatrix.f -= $origin.y;
            mutationObject.scale.transformedPoint = svgPoint.matrixTransform(mutationObject.scale.startMatrix);

            $svgEl.addEventListener('mouseup', mouseUp);
            $svgEl.addEventListener('mousemove', mouseMove);
        }
    };

    /**
     * Removes the table from the tables array if in delete mode
     * @returns {void}
     */
    const removeTable = (): void => {
        if ($bluePrintMode === BlueprintMode.Delete) {
            $tables = $tables.filter((t) => t !== table);
        }
    };

    /**
     * Selects the table and sets the user table details if the admin panel is not shown.
     * @param {MouseEvent} e the mouse event object.
     * @returns {Promise<void>}
     */
    const selectTable = async (e: MouseEvent): Promise<void> => {
        if (!$showAdminPanel) {
            setUserTableDetails();
        }
    };

    /**
     * Sets the user table details by fetching data from the server and updating the modal message.
     * @returns {void}
     */
    const setUserTableDetails = (): void => {
        getUserDateDetails(table.tableId, $dateString, $tokenMSAL).then((tableDetails) => {
            modal.setModalMessage(tableDetails);
        });
    };

    /**
     * Loads the user data for the table asynchronously.
     * @returns {Promise<void>} promise that resolves once the user data is loaded.
     */
    const loadTableUser = async (): Promise<void> => {
        if (table.isLoaded) return;
        if (table.userId) {
            const userDataPromise = getUserData(table.userId, $tokenMSAL);
            const userImagePromise = getUserImage(table.userId, $tokenMSAL);

            const [userData, userImage] = await Promise.all([userDataPromise, userImagePromise]);
            table.isLoaded = true;

            if (userData && userImage) {
                table.user = {};
                if (userData) {
                    table.user.firstname = userData.data.givenName;
                    table.user.lastname = userData.data.surname;
                }
                if (userImage) {
                    table.user.profile = userImage.data;
                }
            }
        }
    };
</script>

{#if !$showAdminPanel}
    <Modal bind:this="{modal}" table="{table}" />
{/if}
<g
    bind:this="{group}"
    id="{`table-trigger-${table.tableId}`}"
    transform="{`matrix(${table.matrix.a}, ${table.matrix.b}, ${table.matrix.c}, ${table.matrix.d}, ${table.matrix.e}, ${table.matrix.f})`}"
>
    <line
        x1="{table.rect.topLine.start.point.x}"
        y1="{table.rect.topLine.start.point.y}"
        x2="{table.rect.topLine.end.point.x}"
        y2="{table.rect.topLine.end.point.y}"
        stroke="black"></line>
    {#if !$showAdminPanel}
        <rect
            class="seat"
            x="{table.rect.point.x + table.rect.width / 2 - 10}"
            y="{table.rect.point.y - 10}"
            width="20"
            height="20"
            stroke="black"></rect>
    {/if}
    <circle
        on:mousedown="{(e) => {
            startRotate(e);
        }}"
        cx="{table.rect.topLine.end.point.x}"
        cy="{table.rect.topLine.end.point.y}"
        r="5"></circle>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <rect
        bind:this="{table.rect.rectSVG}"
        on:mousedown="{(e) => {
            startDrag(e);
            selectTable(e);
            removeTable();
        }}"
        on:mouseover="{loadTableUser}"
        x="{table.rect.point.x}"
        y="{table.rect.point.y}"
        width="{table.rect.width}"
        height="{table.rect.height}"
        rx="{$showAdminPanel ? 0 : 10}"
        ry="{$showAdminPanel ? 0 : 5}"
        class:available="{table.state === 'Available' || !table.state}"
        class:occupied="{table.state === 'Occupied'}"
        class:green="{table.state === 'Green'}"
        class:me="{table.isItMe}"
        class:remove="{$bluePrintMode === BlueprintMode.Delete}"></rect>
    <circle
        on:mousedown="{(e) => {
            startScale(e);
        }}"
        cx="{table.rect.bottomRightPoint.point.x}"
        cy="{table.rect.bottomRightPoint.point.y}"
        r="5"></circle>
    {#if table.isItMe && !$showAdminPanel}<g
            style="{`transform: translate(${table.rect.point.x + table.rect.width / 2}px, ${
                table.rect.point.y + table.rect.height / 2
            }px) rotate(${-Math.atan2(table.matrix.b, table.matrix.a) * (180 / Math.PI)}deg) 
        translate(-20px, +10px)
        `}"
        >
            <text class="me" x="0" y="0">Du</text>
        </g>
    {/if}
</g>

<style>
    rect {
        stroke: #3c3c3b;
        stroke-width: 2;
    }
    rect:hover {
        cursor: pointer;
    }
    :global(.admin rect:hover) {
        cursor: grab;
    }
    :global(.admin rect:active) {
        cursor: grabbing;
    }
    :global(.admin rect.green),
    :global(.admin rect.available),
    :global(.admin rect.occupied) {
        fill: transparent;
        stroke: #3c3c3b;
    }
    :global(rect.available) {
        fill: #e7e7e7;
    }

    :global(rect.green) {
        fill: #1ed24b;
    }

    :global(rect.occupied) {
        fill: #ef7d00;
    }

    rect.remove:hover {
        cursor: url('../../../assets/eraser-solid.svg'), auto;
        stroke: red;
        stroke-width: 4px;
    }
    rect.seat {
        fill: #3c3c3b;
        stroke: #3c3c3b;
    }
    :global(.popover.fade.bs-popover-top.show) {
        z-index: 1;
    }

    text.me {
        font: 30px sans-serif;
        fill: #fff;
        user-select: none;
        pointer-events: none;
    }
</style>
