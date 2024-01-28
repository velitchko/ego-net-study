import { Injectable } from '@angular/core';
import { DATA } from '../assets/miserables.js';


export type Node = { id: string | number, label: string, index: number, group: number };
export type Edge = { source: string | number, target: string | number, value: number };
export type Cell = { source : string | number, target: string | number, value: number, x: number, y: number };
export type NodeExt =  Node & { x: number, y: number };
export type EdgeExt =  Edge & { source: NodeExt, target: NodeExt };
@Injectable({
    providedIn: 'root'
})

export class DataService {
    private nodes: Array<Node>;
    private edges: Array<Edge>;
    private matrix: Array<Cell>;

    constructor() {
        this.nodes = [];
        this.edges = [];
        this.matrix = [];

        // parse data from json file in assets dir
        this.parseData(DATA);
    }

    setNodes(nodes: Array<Node>): void {
        this.nodes = nodes;
    }

    getNodes(): Array<Node> {
        return this.nodes.slice();
    }

    setEdges(edges: Array<Edge>): void {
        this.edges = edges;
    }

    getEdges(): Array<Edge> {
        return this.edges.slice();
    }

    getMatrix(): Array<Cell> {
        return this.matrix.slice();
    }

    addNode(node: Node): void {
        this.nodes.push(node);
    }

    addEdge(edge: Edge): void {
        this.edges.push(edge);
    }

    parseData(data: any): void {
        const nodes = data.nodes;
        const edges = data.links;

        // parse nodes
        nodes.forEach((node: { id: string, group: number }, i: number) => {
            this.addNode({
                id: node.id, label: node.id, index: i, group: node.group
            });
        });

        // parse edges
        let edgeHash = new Map<string, Edge>();

        edges.forEach((edge: { source: string, target: string, value: number }, i: number) => {
            let idA: string, idB: string = '';
            if (edge.source === edge.target) return;

            idA = `${edge.source}-${edge.target}`;
            idB = `${edge.target}-${edge.source}`;

            edgeHash.set(idA, edge);
            edgeHash.set(idB, edge);

            this.addEdge({
                source: edge.source, target: edge.target, value: edge.value
            });
        });

        // parse matrix
        this.nodes.forEach((source: Node) => {
            this.nodes.forEach((target: Node) => {
                
                let edge = `${source.id}-${target.id}`;
                const edgeValue = edgeHash.get(edge)?.value;

                this.matrix.push({
                    source: source.id,
                    target: target.id,
                    x: source.index,
                    y: target.index,
                    value: edgeValue === undefined ? 0 : edgeValue
                });
            });
        });   
    }
}