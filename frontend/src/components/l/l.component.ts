import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { GlobalErrorHandler } from '../../services/error.service';
@Component({
    selector: 'app-l',
    templateUrl: './l.component.html',
    styleUrls: ['./l.component.scss']
})
export class LComponent implements OnInit {
    @Input() data: any = [];
    @Input() width: number = 960;
    @Input() height: number = 600;

    private margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    }

    private nodes: Array<{ id: string | number, label: string }>;
    private edges: Array<{ source: string | number, target: string | number, value: number }>;
    private hops = [1, 2, 3, 4, 5];
    private radius = 50;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, any, any, any>;
    private edgesSelection: d3.Selection<SVGPathElement, d3.HierarchyLink<any>, any, any>;
    private buffersSelection: d3.Selection<SVGCircleElement, any, any, any>;
    private guidesSelection: d3.Selection<SVGCircleElement, any, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, any, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private errorService: GlobalErrorHandler) {
        this.nodes = this.dataService.getNodes() as Array<NodeExt>;
        this.edges = this.dataService.getEdges() as Array<EdgeExt>;

        this.nodesSelection = d3.select('#l-container').selectAll('circle.node');
        this.edgesSelection = d3.select('#l-container').selectAll('line.link');
        this.buffersSelection = d3.select('#l-container').selectAll('circle.buffer');
        this.guidesSelection = d3.select('#l-container').selectAll('circle.guide');
        this.textsSelection = d3.select('#l-container').selectAll('text.label');

        this.zoom = d3.zoom();
    }

    ngOnInit(): void {
        try {
            this.draw();
        } catch (error) {
            this.errorService.handleError(error);
        }   
    }

    color(hop: number): string {
        switch (hop) {
            case -1:
                return 'black';
            case 0:
                return 'black';
            case 1:
                return 'red';
            case 2:
                return 'blue';
            case 3:
                return 'turquoise';
            case 4:
                return 'pink';
            case 5:
                return 'green';
            default:
                return 'black';
        }
    }

    draw(): void {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#r-container').selectAll('g')
                    .attr('transform', $event.transform);
            });

            const svg = d3.select('#l-container')
            .attr('width', this.width - this.margins.left - this.margins.right)
            .attr('height', this.height - this.margins.top - this.margins.bottom)
            .call(this.zoom.bind(this));

            const g = svg.append('g')
            .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');

        const root = d3.stratify()
            .id((d: any) => d.id)
            .parentId((d: any) => d.parent)
            (this.nodes);

        const dx = 10;
        const dy = this.width / (root.height + 1);

        const tree = d3.tree().nodeSize([dx, dy]);
        // Sort the tree and apply the layout.
        root.sort(((a: any, b: any) => d3.descending(a.data.weighted, b.data.weighted)));
        tree(root);

        // Compute the extent of the tree. Note that x and y are swapped here
        // because in the tree layout, x is the breadth, but when displayed, the
        // tree extends right rather than down.
        let x0 = Infinity;
        let x1 = -x0;
        root.each((d: any) => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });

        // Compute the adjusted height of the tree.
        const height = x1 - x0 + dx * 2;

        const edges = g.append('g')
            .attr('id', 'links');

        const link = d3.linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x);
        
        this.edgesSelection = edges.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'link')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5)
            .attr('d', (d: any) => link(d));

        const nodes = g.append('g')
            .attr('id', 'nodes');
        
        this.nodesSelection = nodes.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 3)
            .attr('fill', '#fff') // TODO: Define d.hop from original code
            .attr('r', 2.5)
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

        const labels = g.append('g')
            .attr('id', 'labels');

        this.textsSelection = labels.selectAll('.label')
            .data(root.descendants())
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('dy', '0.31em')
            .attr('x', d => d.children ? -6 : 6)
            .attr('text-anchor', d => d.children ? 'end' : 'start')
            .text((d: any) => d.data.id)
            .clone(true).lower()
            .attr('stroke', 'white');
    }
}
