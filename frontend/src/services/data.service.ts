import { Injectable } from '@angular/core';
// FIRST TASK
import { DATA_T_ONE_PRE } from '../assets/miserables.7466811289384769737.2_precomputed';
import { DATA_T_ONE } from '../assets/miserables.7466811289384769737.2.js';
// SECOND TASK
import { DATA_T_TWO_PRE } from '../assets/miserables.434827120503882069.20_precomputed';
import { DATA_T_TWO } from '../assets/miserables.434827120503882069.20';
// THIRD TASK
import { DATA_T_THREE_PRE } from '../assets/miserables.2499354945414561156.19_precomputed';
import { DATA_T_THREE } from '../assets/miserables.2499354945414561156.19';
// FOURTH TASK
import { DATA_T_FOUR_PRE } from '../assets/miserables.8139397558749019675.37_precomputed';
import { DATA_T_FOUR } from '../assets/miserables.8139397558749019675.37';
// FIFTH TASK
import { DATA_T_FIVE_PRE } from '../assets/miserables.8508913866583860255.60_precomputed';
import { DATA_T_FIVE } from '../assets/miserables.8508913866583860255.60';
// SIXTH TASK
import { DATA_T_SIX_PRE } from '../assets/miserables.4363687599787157139.26_precomputed';
import { DATA_T_SIX } from '../assets/miserables.4363687599787157139.26';


import { CONFIG } from '../assets/config';


export type Node = { 
    id: string | number, 
    label: string, 
    index: number, 
    ego: string | number, 
    hop: number, 
    weight: number, 
    parent: string | number, 
    x?: number, 
    y?: number,
    nlx?: number,
    nly?: number,
    rx?: number, 
    ry?: number,
    lx?: number,
    ly?: number,
};
export type Edge = { source: string | number, target: string | number, weight: number, ego: string | number, hop: number, x1?: number, y1?: number, x2?: number, y2?: number };
export type Cell = { source: string | number, target: string | number, weight: number, x: number, y: number, ego: string | number, hop: number };
export type NodeExt = Node & { x: number, y: number };
export type EdgeExt = Edge & { source: NodeExt, target: NodeExt };
@Injectable({
    providedIn: 'root'
})

export class DataService {
    // private datasets: Map<string, any> = new Map([
    //     ['nodelink', CONFIG.PRECOMPUTED ? DATA_NL_PRE : DATA_NL],
    //     ['matrix', CONFIG.PRECOMPUTED ? DATA_M : DATA_M],
    //     ['layered', CONFIG.PRECOMPUTED ? DATA_L_PRE : DATA_L],
    //     ['radial', CONFIG.PRECOMPUTED ? DATA_R_PRE : DATA_R]
    // ]);
    private datasets: Map<string, any> = new Map([
        ['t1', CONFIG.PRECOMPUTED ? DATA_T_ONE_PRE : DATA_T_ONE], 
        ['t2', CONFIG.PRECOMPUTED ? DATA_T_TWO_PRE : DATA_T_TWO], 
        ['t3', CONFIG.PRECOMPUTED ? DATA_T_THREE_PRE : DATA_T_THREE], 
        ['t4', CONFIG.PRECOMPUTED ? DATA_T_FOUR_PRE : DATA_T_FOUR], 
        ['t5', CONFIG.PRECOMPUTED ? DATA_T_FIVE_PRE : DATA_T_FIVE], 
        ['t6', CONFIG.PRECOMPUTED ? DATA_T_SIX_PRE : DATA_T_SIX],
    ]);

    private parsedData: Map<string, { nodes: Array<Node>, edges: Array<Edge>, matrix: Array<Cell> }>;

    constructor() {
        this.parsedData = new Map<string, { nodes: Array<Node>, edges: Array<Edge>, matrix: Array<Cell> }>();
        // iterate over datasets and parse data from json file in assets dir
        this.datasets.forEach((data: any, key: string) => {
            if(!CONFIG.PRECOMPUTED) {
                const parsed = this.parseData(data);
                this.parsedData.set(key, { nodes: parsed.nodes, edges: parsed.links, matrix: parsed.matrix || [] });
            } else {
                
                const parsed = this.parsePrecomputedData(data);
                this.parsedData.set(key, { nodes: parsed.nodes, edges: parsed.links, matrix: parsed.matrix || [] });
            }
        });


        console.log(this.parsedData);
    }

    // get data per task type
    getDatasetNodes(key: string): Array<Node> {
        return this.parsedData.get(key)?.nodes.slice() || this.parseData('t1').nodes.slice();
    }

    getDatasetEdges(key: string): Array<Edge> {
        return this.parsedData.get(key)?.edges.slice() ||  this.parseData('t1').links.slice();
    }

    getDatasetMatrix(key: string): Array<Cell> {
        return this.parsedData.get(key)?.matrix.slice() || [];
    }

    parsePrecomputedData(data: any): { nodes: Array<Node>, links: Array<Edge>, matrix?: Array<Cell> } {

        const nodes = data.nodes;
        const edges = data.links;
    
        const parsedNodes = new Array<Node>();
        const parsedEdges = new Array<Edge>();

        nodes.forEach((node: { id: string | number, ego: string | number, hop: number, weighted: number, parent: string | number, x?: number, y?: number, nlx: number, nly: number, lx: number, ly: number, rx: number, ry: number }, i: number) => {
            parsedNodes.push({
                id: node.id,
                label: `${node.id}`,
                index: i,
                hop: node.hop,
                ego: node.ego,
                weight: node.weighted,
                parent: node.parent,
                nlx: node.nlx,
                nly: node.nly,
                lx: node.lx,
                ly: node.ly,
                rx: node.rx,
                ry: node.ry,
            });
        });

        // parse edges
        let edgeHash = new Map<string, Edge>();
        // { source: string | number, target: string | number, weight: number, ego: string | number, hop: number };
        edges.forEach((edge: { source: string | number, target: string | number, weight: number, ego: string | number, hop: number, x1?: number, y1?: number, x2?: number, y2?: number }, i: number) => {
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
                hop: edge.hop,
                x1: edge.x1 || 0,
                y1: edge.y1 || 0,
                x2: edge.x2 || 0,
                y2: edge.y2 || 0
            });
        });


        return {
            nodes: parsedNodes,
            links: parsedEdges,
        };
    }

    parseData(data: any): { nodes: Array<Node>, links: Array<Edge>, matrix?: Array<Cell> } {
        const nodes = data.nodes;
        const edges = data.links;
        
        const parsedNodes = new Array<Node>();
        const parsedEdges = new Array<Edge>();
        const parsedMatrix = new Array<Cell>();

        // parse nodes
        // id: string | number, label: string, index: number, ego: string | number, hop: number, weight: number, parent: string | number };
        nodes.forEach((node: { id: string | number, ego: string | number, hop: number, weighted: number, parent: string | number, x?: number, y?: number, nlx?: number, nly?: number, lx?: number, ly?: number, rx?: number, ry?: number }, i: number) => {
            parsedNodes.push({
                id: node.id,
                label: `${node.id}`,
                index: i,
                hop: node.hop,
                ego: node.ego,
                weight: node.weighted,
                parent: node.parent,
                x: node.x || 0,
                y: node.y || 0,
                nlx: node.nlx,
                nly: node.nly,
                lx: node.lx,
                ly: node.ly,
                rx: node.rx,
                ry: node.ry,
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
                hop: edge.hop,
                // get target x and y
                x1: nodes.find((n: Node) => n.id === edge.source)?.x || 0,
                y1: nodes.find((n: Node) => n.id === edge.source)?.y || 0,
                x2: nodes.find((n: Node) => n.id === edge.target)?.x || 0,
                y2: nodes.find((n: Node) => n.id === edge.target)?.y || 0
            });
        });

        // parse matrix
        // parsedNodes.forEach((source: Node) => {
        //     parsedNodes.forEach((target: Node) => {
        //         let edge = `${source.id}-${target.id}`;

        //         parsedMatrix.push({
        //             source: source.id,
        //             target: target.id,
        //             x: source.index,
        //             y: target.index,
        //             weight: edgeHash.has(edge) ? edgeHash.get(edge)?.weight || 0 : 0,
        //             ego: edgeHash.has(edge) ? edgeHash.get(edge)?.ego || 0 : 0,
        //             hop: edgeHash.has(edge) ? edgeHash.get(edge)?.hop || 0 : 0,
        //         });
        //     });
        // });  

        return {
            nodes: parsedNodes,
            links: parsedEdges,
            // matrix: parsedMatrix
        };
    }
}