import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { Node, DataService, Edge, Cell } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';

@Component({
    selector: 'app-m',
    templateUrl: './m.component.html',
    styleUrls: ['./m.component.scss']
})
export class MComponent implements OnInit {
    @Input() data: any = [];
    @Input() width: number = 960;
    @Input() height: number = 600;

    private margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    }
    
    private cellSize = 20;

    private nodes: Array<Node>;
    private matrix: Array<Cell>;
    private hops = [1, 2, 3, 4, 5];
    private radius = 50;

    // d3 selections
    private cellsSelection: d3.Selection<SVGRectElement, Cell, any, any>;
    private rowsSelection: d3.Selection<SVGTextElement, Node, any, any>;
    private colsSelection: d3.Selection<SVGTextElement, Node, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private errorService: GlobalErrorHandler) {
        this.nodes = this.dataService.getNodes();
        this.matrix = this.dataService.getMatrix();

        this.cellsSelection = d3.select('#m-container').selectAll('rect.node');
        this.rowsSelection = d3.select('#m-container').selectAll('text.label');
        this.colsSelection = d3.select('#m-container').selectAll('text.label');

        this.zoom = d3.zoom();
    }

    ngAfterViewInit(): void {
        try {
            this.draw();
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    mouseover($event: MouseEvent): void {
        const id = ($event.target as any).id;

        const source = id.split('-')[1];
        const target = id.split('-')[2];

        // select all cells where source or target is the current node
        const cells = this.cellsSelection
            .filter((d: Cell) => d.source.toString().replace('.', '') === source || d.target.toString().replace('.', '') === target);

        cells
            .attr('fill', (d: Cell) => {
                return 'red';
            })
            .attr('fill-opacity', (d: Cell) => (d.value > 0 ? 1 : 0.1));
            
        // select current id and set opacity to 1
        d3.select(`#${id}`)
            .attr('fill', 'red')
            .attr('fill-opacity', 1);

        // set all labels opacity to 0.1
        this.rowsSelection
            .attr('fill-opacity', 0.1);

        this.colsSelection
            .attr('fill-opacity', 0.1);

        // select all labels where source or target is the current node
        const labels = this.rowsSelection
            .filter((d: Node) => d.id.toString().replace('.', '') === source);

        labels
            .attr('font-weight', 'bold')
            .attr('fill', 'red')
            .attr('fill-opacity', 1);

        // select all labels where source or target is the current node
        const cols = this.colsSelection
            .filter((d: Node) => d.id.toString().replace('.', '') === target);

        cols
            .attr('font-weight', 'bold')
            .attr('fill', 'red')
            .attr('fill-opacity', 1);
    }

    mouseout(): void {
        this.cellsSelection
            .attr('fill', (d: Cell) => {
                if (d.value > 0) {
                    return 'white';
                }
                return 'transparent';
            })
            .attr('fill-opacity', 1);

        this.rowsSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', 1);

        this.colsSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', 1);
    }

    draw(): void {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#m-container').selectAll('g')
                    .attr('transform', $event.transform);
            });

        // set svg width and height
        const svg = d3.select('#m-container')
            .attr('width', this.width - this.margins.left - this.margins.right)
            .attr('height', this.height - this.margins.top - this.margins.bottom)
            .call(this.zoom.bind(this));

        const g = svg.append('g')
            .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');


        // set up the scales
        const x = d3.scaleBand().range([0, this.width - this.margins.left - this.margins.right]);
        const y = d3.scaleBand().range([0, this.height - this.margins.top - this.margins.bottom]);

        // set up the domains

        const matrix = g.append('g')
            .attr('id', 'matrix');

        this.cellsSelection = matrix.selectAll('.node')
            .data(this.matrix)
            .enter()
                .append('rect')
                .attr('class', 'node')
                .attr('id', (d: Cell) => `cell-${(d.source as string).replace('.', '')}-${(d.target as string).replace('.', '')}`)
                .attr('x', (d: Cell) => d.x * this.cellSize) 
                .attr('y', (d: Cell) => d.y * this.cellSize)
                .attr('width', this.cellSize)
                .attr('height', this.cellSize)
                .attr('fill', (d: Cell) => {
                    if (d.value > 0) {
                        return 'white';
                    }
                    return 'transparent';
                })
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .on('mouseover', this.mouseover.bind(this))
                .on('mouseout', this.mouseout.bind(this));

        const rowLabels = g.append('g')
            .attr('id', 'row-labels');

        this.rowsSelection = rowLabels.selectAll('.row-label')
            .data(this.nodes)
            .enter()
                .append('text')
                .attr('class', 'row-label')
                .attr('id', (d: Node) => `label-${(d.id as string).replace('.', '')}`)
                .attr('font-size', 10)
                .attr('text-anchor', 'start')
                .attr('x', (d: Node) => d.index * this.cellSize + 10) 
                .attr('y', -this.cellSize/4)
                .attr('transform', (d: Node) => {
                    return `rotate(-45, ${d.index * this.cellSize + 10}, ${-this.cellSize/4})`;
                })
                .attr('fill', 'white')
                .text((d: Node) => d.id);

        const columnLabels = g.append('g')
            .attr('id', 'col-labels');

        this.colsSelection = columnLabels.selectAll('.col-label')
            .data(this.nodes)
            .enter()
                .append('text')
                .attr('class', 'col-label')
                .attr('id', (d: Node) => `label-${(d.id as string).replace('.', '')}`)
                .attr('y', (d: Node) => d.index * this.cellSize + 10)
                .attr('x', -this.cellSize/4)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'top')
                .attr('fill', 'white')
                .attr('font-size', 10)
                .text((d: Node) => d.id);       
    }

}
