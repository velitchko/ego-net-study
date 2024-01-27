import { Injectable } from '@angular/core';
import { DATA } from '../assets/miserables.js';


export type Node = { id: string | number, label: string, index: number, group: number };
export type Edge = { source: string | number, target: string | number, value: number };
export type Cell = { source : string | number, target: string | number, value: number, x: number, y: number };
@Injectable({
    providedIn: 'root'
})

export class DataService {
    private nodes: Array<Node>;
    private edges: Array<Edge>;

    constructor() {
        this.nodes = [];
        this.edges = [];

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
        const matrix: Array<Cell> = new Array<Cell>();

        let edgeHash = new Map<string, any>();
        this.edges
            .forEach((link: Edge) => {
                // Undirected graph - duplicate link s-t && t-s
                let idA: string, idB: string = '';
                if (link.source === link.target) return;

                idA = `${link.source}-${link.target}`;
                idB = `${link.target}-${link.source}`;

                edgeHash.set(idA, link);
                edgeHash.set(idB, link);
            });
        console.log(edgeHash);

        this.nodes.forEach((source: Node) => {
            this.nodes.forEach((target: Node) => {
                let edge = `${source.id}-${target.id}`;              
                    matrix.push({
                        source: source.id,
                        target: target.id,
                        x: source.index,
                        y: target.index,
                        value: edgeHash.get(edge) ? edgeHash.get(edge).value : 0
                    });
                
            });
        });

        return matrix;
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

        nodes.forEach((node: { id: string, group: number }, i: number) => {
            this.addNode({
                id: node.id, label: node.id, index: i, group: node.group
            });
        });

        edges.forEach((edge: { source: string, target: string, value: number }, i: number) => {

            this.addEdge({
                source: edge.source, target: edge.target, value: edge.value
            });
        });
    }

}