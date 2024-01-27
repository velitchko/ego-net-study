import { Injectable } from '@angular/core';
import { DATA } from '../assets/miserables.js';

@Injectable({
    providedIn: 'root'
})

export class DataService {
    private nodes: Array<{ id: string | number, label: string, index: number, group: number }>;
    private edges: Array<{ source: string | number, target: string | number, value: number }>;

    constructor() { 
        this.nodes = [];
        this.edges = [];

        // parse data from json file in assets dir
        this.parseData(DATA);
    }

    setNodes(nodes: Array<{ id: string | number, label: string, index: number, group: number }>): void {
        this.nodes = nodes;
    }

    getNodes(): Array<{ id: string | number, label: string }> {
        return this.nodes;
    }

    setEdges(edges: Array<{ source: string | number, target: string | number, value: number }>): void {
        this.edges = edges;
    }

    getEdges(): Array<{ source: string | number, target: string | number, value: number }> {
        return this.edges;
    }

    addNode(node: { id: string | number, label: string, index: number, group: number }): void {
        this.nodes.push(node);
    }

    addEdge(edge: { source: string | number, target: string | number, value: number }): void {
        this.edges.push(edge);
    }

    parseData(data: any): void {
        const nodes = data.nodes;
        const edges = data.links;
        
        nodes.forEach((node: {id: string, group: number } , i: number) => {
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