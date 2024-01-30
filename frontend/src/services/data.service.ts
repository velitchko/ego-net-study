import { Injectable } from '@angular/core';
import { DATA_NL } from '../assets/miserables.434827120503882069.20.js';
import { DATA_M } from '../assets/miserables.2499354945414561156.19.js';
import { DATA_R } from '../assets/miserables.3848446828006397221.35.js';
import { DATA_L } from '../assets/miserables.8139397558749019675.37.js';


export type Node = { id: string | number, label: string, index: number, ego: string | number, hop: number, weight: number, parent: string | number };
export type Edge = { source: string | number, target: string | number, weight: number, ego: string | number, hop: number };
export type Cell = { source : string | number, target: string | number, weight: number, x: number, y: number, ego: string | number, hop: number };
export type NodeExt =  Node & { x: number, y: number };
export type EdgeExt =  Edge & { source: NodeExt, target: NodeExt };
@Injectable({
    providedIn: 'root'
})

export class DataService {
    
    private datasets: Map<string, any> = new Map([
        ['nodelink', DATA_NL],
        ['matrix', DATA_M],
        ['layered', DATA_L],
        ['radial', DATA_R]
    ]);

    private parsedData: Map<string, { nodes: Array<Node>, edges: Array<Edge>, matrix: Array<Cell> }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge>, matrix: Array<Cell>}>();
        // iterate over datasets and parse data from json file in assets dir
        this.datasets.forEach((data: any, key: string) => {
            const parsed = this.parseData(data);
            this.parsedData.set(key, { nodes: parsed.nodes, edges: parsed.links, matrix: parsed.matrix });
        });
        
    }

    getDatasetNodes(key: string): Array<Node> {
        return this.parsedData.get(key)?.nodes.slice() || [];
    }

    getDatasetEdges(key: string): Array<Edge> {
        return this.parsedData.get(key)?.edges.slice() || [];
    }

    getDatasetMatrix(key: string): Array<Cell> {
        return this.parsedData.get(key)?.matrix.slice() || [];
    }

    parseData(data: any): { nodes: Array<Node>, links: Array<Edge>, matrix: Array<Cell> } {
        const nodes = data.nodes;
        const edges = data.links;

        const parsedNodes = new Array<Node>();
        const parsedEdges = new Array<Edge>();
        const parsedMatrix = new Array<Cell>();

        // parse nodes
        // id: string | number, label: string, index: number, ego: string | number, hop: number, weight: number, parent: string | number };
        nodes.forEach((node: { id: string | number , ego: string | number, hop: number, weight: number, parent: string | number }, i: number) => {
            parsedNodes.push({
                id: node.id, 
                label: `${node.id}`, 
                index: i, 
                hop: node.hop,
                ego: node.ego,
                weight: node.weight,
                parent: node.parent
            });
        });

        // parse edges
        let edgeHash = new Map<string, Edge>();
        // { source: string | number, target: string | number, weight: number, ego: string | number, hop: number };
        edges.forEach((edge: { source: string | number, target: string | number, weight: number, ego: string | number, hop: number }, i: number) => {
            let idA: string, idB: string = '';
            if (edge.source === edge.target) return;

            idA = `${edge.source}-${edge.target}`;
            idB = `${edge.target}-${edge.source}`;

            edgeHash.set(idA, edge);
            edgeHash.set(idB, edge);

            parsedEdges.push({
                source: edge.source, 
                target: edge.target, 
                weight: edge.weight,
                ego: edge.ego,
                hop: edge.hop
            });
        });

        // parse matrix
        parsedNodes.forEach((source: Node) => {
            parsedNodes.forEach((target: Node) => {
                let edge = `${source.id}-${target.id}`;

                parsedMatrix.push({
                    source: source.id,
                    target: target.id,
                    x: source.index,
                    y: target.index,
                    weight: edgeHash.has(edge) ? edgeHash.get(edge)?.weight || 0 : 0,
                    ego: edgeHash.has(edge) ? edgeHash.get(edge)?.ego || 0 : 0,
                    hop: edgeHash.has(edge) ? edgeHash.get(edge)?.hop || 0 : 0,
                });
            });
        });  
        
        return {
            nodes: parsedNodes,
            links: parsedEdges,
            matrix: parsedMatrix
        };
    }
}