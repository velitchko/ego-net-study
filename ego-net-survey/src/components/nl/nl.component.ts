// setup node-link component 

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-nl',
    templateUrl: './nl.component.html',
    styleUrls: ['./nl.component.scss']
})
export class NlComponent implements OnInit, OnChanges {
    @Input() data: any = [];
    @Input() width: number = 960;
    @Input() height: number = 600;

    constructor() { }

    ngOnInit(): void {
        this.draw();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.draw();
    }

    draw() {
        if (!this.data) {
            return;
        }

        const svg = d3.select('#nl');
        svg.selectAll('*').remove();

        const width = this.width;
        const height = this.height;

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id((d: any) => d.id))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.data.links)
            .enter().append('line')
            .attr('stroke-width', (d: any) => Math.sqrt(d.value));

        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.data.nodes)
            .enter().append('circle')
            .attr('r', 5)
            .attr('fill', (d: any) => color(d.group));

        node.append('title')
            .text((d: any) => d.id);

        simulation
            .nodes(this.data.nodes)
            .on('tick', () => {
                link
                    .attr('x1', (d: any) => d.source.x)
                    .attr('y1', (d: any) => d.source.y)
                    .attr('x2', (d: any) => d.target.x)
                    .attr('y2', (d: any) => d.target.y);

                node
                    .attr('cx', (d: any) => d.x)
                    .attr('cy', (d: any) => d.y);
            });

    }
}
