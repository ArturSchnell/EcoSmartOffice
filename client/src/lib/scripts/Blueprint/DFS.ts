import type { edge, node } from '../Types/types.js';
import { Point, type Line } from './surfaces.js';

/**
 * Depth First Search (DFS) algorithm for cycle finding
 */
export class DFS {
    static #startNodeNo: number = 0;
    static #nodesCopy: node[] = new Array();
    static #nodes: node[] = new Array();
    static #edges: edge[] = new Array();

    /**
     * Starts the cycle finding process
     * @returns {Array<Point[]>} array of extracted cycles
     */
    static run(): Array<Point[]> {
        this.#nodes = this.#nodesCopy.map(node => ({ ...node, adj: [] }));
        this.#edges.forEach((edge: edge) => {
            const v1: node = this.#nodes[edge[0]];
            const v2: node = this.#nodes[edge[1]];
            v1.adj.push(v2);
            v2.adj.push(v1);
        });

        return this.#extractCycles();
    }

    /**
     * Resets the DFS algorithm by clearing all data
     * @returns {void}
     */
    static reset(): void {
        this.#startNodeNo = 0;
        this.#nodesCopy = new Array();
        this.#nodes = new Array();
        this.#edges = new Array();
    }

    /**
     * Gets the copy of nodes
     * @returns {node[]} the copy of nodes
     */
    static getNodes(): node[] {
        return this.#nodesCopy;
    }

    /**
     * Gets the edges
     * @returns {edge[]} the edges
     */
    static getEdges(): edge[] {
        return this.#edges;
    }

    /**
     * Sets the nodes
     * @param {node[]} nodes the nodes to set
     * @returns {void}
     */
    static setNodes(nodes: node[]): void {
        this.#nodesCopy = nodes;
    }

    /**
     * Sets the edges
     * @param {edge[]} edges the edges to set
     * @returns {void}
     */
    static setEdges(edges: edge[]): void {
        this.#edges = edges;
    }

    /**
     * Sets the start node number
     * @param {number} startNumber the start node number to set
     * @returns {void}
     */
    static setStartNodeNo(startNumber: number): void {
        this.#startNodeNo = startNumber;
    }

    /**
     * Checks if a node with the given point exists
     * @param {Point} point the point to check
     * @returns {boolean} true if a node with the point exists, false otherwise
     */
    static existNode(point: Point): boolean {
        this.#nodesCopy.find((node: node) => {
            return Math.trunc(node.point.x) == Math.trunc(point.x) && Math.trunc(node.point.y) == Math.trunc(point.y)
        });

        return false;
    }

    /**
     * Extracts cycles using the DFS algorithm
     * @returns {Array<Point[]>} array of cycles represented as arrays of points
     */
    static #extractCycles(): Array<Point[]> {
        const cycles: Array<node[]> = new Array();
        while (this.#nodes.length > 0) {
            const v = this.#leftBottomNode(this.#nodes);
            const path = this.#reducePath(this.#closedPathFrom(v));
            if (path.length > 2) {
                cycles.push(path);
            }
            this.#removeEdge(path[0], path[1]);
            this.#nodes = this.#removeConnectionAt(path[0], this.#nodes);
            this.#nodes = this.#removeConnectionAt(path[1], this.#nodes);
        }

        return cycles.map((cycle: node[]) => {
            return cycle.map((node: node) => {
                return node.point; // extract the point value
            });
        });
    }

    /**
     * Corrects the added paths in the DFS algorithm
     * @param {Line} currentLine the current line
     * @param {Point} point the point between the start and end points of the line
     * @returns {void}
     */
    static correctAddedPaths(currentLine: Line, point: Point): void {
        let nodeIndexFirstPoint = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(currentLine.start.point.x) && Math.trunc(node.point.y) == Math.trunc(currentLine.start.point.y));  // 7
        let nodeIndexSecondPoint = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(currentLine.end.point.x) && Math.trunc(node.point.y) == Math.trunc(currentLine.end.point.y)); // 8
        let nodeIndexPointBetween = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(point.x) && Math.trunc(node.point.y) == Math.trunc(point.y));

        this.#correctAddedEdges(nodeIndexFirstPoint, nodeIndexSecondPoint, nodeIndexPointBetween)
    }

    /**
     * Corrects the added edges in the DFS algorithm
     * @param {number} firstNode the index of the first node
     * @param {number} secondNode the index of the second node
     * @param {number} nodeBetween the index of the node between the first and second nodes
     * @returns {void}
     */
    static #correctAddedEdges(firstNode: number, secondNode: number, nodeBetween: number): void {
        if (firstNode > secondNode) {
            [firstNode, secondNode] = [secondNode, firstNode];  // swap both values so that firstNode < secondPoint
        }

        let edgeIndex: number = this.#edges.findIndex(edge => edge[0] == firstNode && edge[1] == secondNode);

        if (edgeIndex !== -1 && firstNode !== -1 && secondNode !== -1 && nodeBetween !== -1) {
            this.#removeOldEdge(edgeIndex);
            this.#addEdge(firstNode, nodeBetween);
            this.#addEdge(nodeBetween, secondNode);
        }
    }

    /**
     * Removes the old edge from the DFS algorithm
     * @param {number} edgeIndex the index of the edge to remove
     * @returns {void}
     */
    static #removeOldEdge(edgeIndex: number): void {
        if (edgeIndex > -1) {
            this.#edges.splice(edgeIndex, 1);
        }
    }

    /**
     * Corrects the removed paths in the DFS algorithm
     * @param {Line} currentLine the Line object representing the removed line
     * @returns {void}
     */
    static correctRemovedPaths(currentLine: Line): void {
        let firstNodeIndex = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(currentLine.start.point.x) && Math.trunc(node.point.y) == Math.trunc(currentLine.start.point.y));
        let secondNodeIndex = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(currentLine.end.point.x) && Math.trunc(node.point.y) == Math.trunc(currentLine.end.point.y));

        if (firstNodeIndex > secondNodeIndex) {
            [firstNodeIndex, secondNodeIndex] = [secondNodeIndex, firstNodeIndex];  // swap both values so that firstNode < secondPoint
        }

        this.#correctRemovedEdges(firstNodeIndex, secondNodeIndex)

        let edgesLowerNode = this.#edges.filter(edge => edge[0] === secondNodeIndex || edge[1] === secondNodeIndex);
        this.#correctRemovedNodes(secondNodeIndex, edgesLowerNode); // first smaller index that reduces all above it by 1
        let edgesHigherNode = this.#edges.filter(edge => edge[0] === firstNodeIndex || edge[1] === firstNodeIndex);
        this.#correctRemovedNodes(firstNodeIndex, edgesHigherNode); // after that larger index that reduces all above it by 1
    }

    /**
     * Corrects the removed edges by removing the edge between the specified indices
     * @param {number} firstIndex the first index of the edge
     * @param {number} secondIndex the second index of the edge
     * @returns {void}
     */
    static #correctRemovedEdges(firstIndex: number, secondIndex: number): void {
        let edgeIndex: number = this.#edges.findIndex(edge => edge[0] == firstIndex && edge[1] == secondIndex);
        this.#removeOldEdge(edgeIndex);
    }

    /**
     * Corrects the removed nodes by updating the edge indices and removing the node at the specified index
     * @param {number} index the index of the node to be removed
     * @param {edge[]} nodeAmount array representing the current node amounts for each edge
     * @returns {void}
     */
    static #correctRemovedNodes(index: number, nodeAmount: edge[]): void {
        if (nodeAmount.length === 0) {
            for (let i = 0; i < this.#edges.length; i++) {
                for (let j = 0; j < this.#edges[i].length; j++) {
                    if (this.#edges[i][j] >= index) {
                        this.#edges[i][j] -= 1;
                    }
                }
            }
            this.#nodesCopy.splice(index, 1);
            this.#startNodeNo--;
        }
    }

    /**
     * Maps the edges in the DFS algorithm
     * @param {Line} line the line object representing the edge
     * @returns {void}
     */
    static mapEdges(line: Line): void {
        const nodeNumbering: number[] = new Array(2);

        for (let i = 0; i < 2; i++) {
            const newNode: node = {
                point: i == 0 ? new Point(line.start.point.x, line.start.point.y) : new Point(line.end.point.x, line.end.point.y),
                adj: []
            }

            const nodeKey: number = this.#nodesCopy.findIndex(node => Math.trunc(node.point.x) == Math.trunc(newNode.point.x) && Math.trunc(node.point.y) == Math.trunc(newNode.point.y));

            if (nodeKey === -1) {   //node doesn't exist yet
                this.#nodesCopy.push(newNode);
                nodeNumbering[i] = this.#startNodeNo++;
            } else {
                nodeNumbering[i] = nodeKey;
            }
        }

        this.#addEdge(nodeNumbering[0], nodeNumbering[1]);
    }

    /**
     * Adds an edge between two nodes in the DFS algorithm
     * @param {number} u the number of the first node
     * @param {number} v the number of the second node
     * @returns {void}
     */
    static #addEdge(u: number, v: number): void {
        if (u > v) {
            [u, v] = [v, u];  // swap both values so that u < v
        }

        const hasLink: edge = this.#edges.find(edge => edge[0] == u && edge[1] == v);
        if (!hasLink) {
            this.#edges.push([u, v]);
        }
    }

    /**
     * Finds the left-bottom node among the given nodes
     * @param {node[]} nodes array of nodes to search from
     * @returns {node} the left-bottom node
     */
    static #leftBottomNode(nodes: node[]): node {
        return nodes.reduce((m: node, v: node) => {
            const dx: number = v.point.x - m.point.x;
            if (dx < 0) return v;
            if (dx > 0) return m;

            return v.point.y - m.point.y < 0 ? m : v;
        });
    }

    /**
     * Finds a closed path starting from the given node
     * @param {node} v the starting node for the path
     * @returns {node[]} array of nodes representing the closed path
     */
    static #closedPathFrom(v: node): node[] {
        let path: node[] = [];
        let curr: node = v;
        let prev: node;
        do {
            path.push(curr);
            [curr, prev] = this.#getNext(curr, prev);
        } while (curr !== v);
        return path;
    }

    /**
     * Reduces a given path to remove any repeated nodes
     * @param {node[]} w the path to be reduced
     * @returns {node[]} the reduced path without repeated nodes
     */
    static #reducePath(w: node[]): node[] {
        for (let i: number = 1; i < w.length; i++) {
            let idup: number = w.lastIndexOf(w[i]);
            if (idup > i) {
                w.splice(i + 1, idup - i);
            }
        }
        return w;
    }

    /**
     * Filters out a specific node from an array of nodes
     * @param {node} node the node to be filtered out
     * @param {node[]} nodes array of nodes to filter
     * @returns {node[]} the filtered array of nodes without the specified node
     */
    static #filterNode(node: node, nodes: node[]): node[] {
        return nodes.filter(n => n !== node);
    }

    /**
     * Removes an edge between two nodes
     * @param {node} v1 the first node of the edge
     * @param {node} v2 the second node of the edge
     * @return {void}
     */
    static #removeEdge(v1: node, v2: node): void {
        v1.adj = this.#filterNode(v2, v1.adj);
        v2.adj = this.#filterNode(v1, v2.adj);
    }

    /**
     * Removes the connection at a node that has less than 2 adjacent nodes
     * @param {node} v the node to remove the connection from
     * @param {node[]} nodes array of nodes
     * @returns {node[]} the updated array of nodes after removing the connection
     */
    static #removeConnectionAt(v: node, nodes: node[]): node[] {
        let current: node = v;
        let next: node;
        while (current && current.adj.length < 2) {
            nodes = this.#filterNode(current, nodes);
            next = current.adj[0];
            if (next) {
                this.#removeEdge(current, next);
            }
            current = next;
        }
        return nodes;
    }

    /**
     * Returns the next node in the cycle path
     * @param {node} v the current node
     * @param {node} prev the previous node in the cycle path
     * @returns {node[]} array containing the next node and the current node
     */
    static #getNext(v: node, prev: node): node[] {
        let next: node = (v.adj.length == 1) ? v.adj[0] : this.#bestByKind(prev, v, !!prev);
        return [next, v];
    }

    /**
     * Returns the best next node based on the kind of connection and the current and previous nodes
     * @param {node} vPrevious the previous node in the cycle path
     * @param {node} vCurrent the current node
     * @param {boolean} kind boolean indicating the kind of connection
     * @returns {node} the best next node
     */
    static #bestByKind(vPrevious: node, vCurrent: node, kind: boolean): node {
        let dCurrent: node;
        let adj: node[] = vCurrent.adj;
        if (vPrevious) {
            dCurrent = this.#vsub(vCurrent, vPrevious);
            adj = this.#filterNode(vPrevious, adj);
        } else {
            dCurrent = { point: new Point(0, -1), adj: [] };
        }

        return adj.reduce((v_so_far, v) => this.#betterByKind(v, v_so_far, vCurrent, dCurrent, kind));
    }

    /**
     * Compares two nodes and returns the better node based on the kind of connection, the current node, and vectors
     * @param {node} v the first node to compare
     * @param {node} vSoFar the second node to compare
     * @param {node} vCurrent the current node
     * @param {node} dCurrent the vector representing the difference between the current node and the previous node
     * @param {boolean} kind boolean indicating the kind of connection
     * @returns {node} the better node
     */
    static #betterByKind(v: node, vSoFar: node, vCurrent: node, dCurrent: node, kind: boolean): node {
        let d: node = this.#vsub(v, vCurrent),
            dSoFar: node = this.#vsub(vSoFar, vCurrent),
            isConvex: boolean = this.#dotPerp(dSoFar, dCurrent) > 0,
            curr2v: number = this.#dotPerp(dCurrent, d),
            vsf2v: number = this.#dotPerp(dSoFar, d),
            isVBetter: boolean;
        if (kind === true) {
            isVBetter = (isConvex && (curr2v >= 0 || vsf2v >= 0)) || (!isConvex && curr2v >= 0 && vsf2v >= 0);
        } else {
            isVBetter = (!isConvex && (curr2v < 0 || vsf2v < 0)) || (isConvex && curr2v < 0 && vsf2v < 0);
        }
        return isVBetter ? v : vSoFar;
    }

    /**
     * Subtracts two nodes and returns the resulting node
     * @param {node} a the first node
     * @param {node} b the second node
     * @returns {node} the resulting node after subtracting the second node from the first node
     */
    static #vsub(a: node, b: node): node {
        return { point: new Point(a.point.x - b.point.x, a.point.y - b.point.y), adj: [] };
    }

    /**
     * Calculates the dot product of two nodes in a perpendicular manner
     * @param {node} a the first node
     * @param {node} b the second node
     * @returns {number} the dot product of the two nodes in a perpendicular manner
     */
    static #dotPerp(a: node, b: node): number {
        return a.point.x * b.point.y - b.point.x * a.point.y;
    }
};