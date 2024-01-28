import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, DataService } from '../../services/data.service';

type NodeExt =  Node & { x: number, y: number };
type EdgeExt =  Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-r',
    templateUrl: './r.component.html',
    styleUrls: ['./r.component.scss']
})
export class RComponent implements OnInit {
    @Input() data: any = [];
    @Input() width: number = 960;
    @Input() height: number = 600;

    private margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    }

    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;
    private hops = [1, 2, 3, 4, 5];
    private radius = 50;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, NodeExt, any, any>;
    private edgesSelection: d3.Selection<SVGLineElement, EdgeExt, any, any>;
    private buffersSelection: d3.Selection<SVGCircleElement, NodeExt, any, any>;
    private guidesSelection: d3.Selection<SVGCircleElement, number, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService) {
        this.nodes = this.dataService.getNodes() as Array<NodeExt>;
        this.edges = this.dataService.getEdges() as Array<EdgeExt>;

        this.nodesSelection = d3.select('#nl-container').selectAll('circle.node');
        this.edgesSelection = d3.select('#nl-container').selectAll('line.link');
        this.buffersSelection = d3.select('#nl-container').selectAll('circle.buffer');
        this.guidesSelection = d3.select('#nl-container').selectAll('circle.guide');
        this.textsSelection = d3.select('#nl-container').selectAll('text.label');

        this.zoom = d3.zoom();
    }

    ngOnInit(): void {
        this.draw();
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


    mouseover($event: MouseEvent) {
        // highlight node and its edges
        // get id of currently selected node
        const id = ($event.target as any).id.replace('node-', '');
        // set opacity of all no    des to 0.1
        this.nodesSelection
            .attr('fill-opacity', 0.1);


        // set opacity of all buffers to 0.1
        this.buffersSelection
            .attr('fill-opacity', 0.1);

        // set opacity of all edges to 0.1
        this.edgesSelection
            .attr('stroke-opacity', 0.1);

        // set opacity of all texts to 0.1
        this.textsSelection
            .style('opacity', 0.1);

        // set opacity of current node to 1
        d3.select(`#node-${id}`)
            .attr('fill-opacity', 1);

        // find targets or sourcdes of current node in this.edges
        const neighbors = new Array<string | number>();

        this.edges.forEach((d: EdgeExt) => {
            if (d.source.id === id) {
                neighbors.push(d.target.id);
            }
            if (d.target.id === id) {
                neighbors.push(d.source.id);
            }
        });

        // set opacity of nodes to 1
        this.nodesSelection
            .filter((d: NodeExt) => {
                // console.log(d)
                return neighbors.includes(d.id);
            })
            .attr('fill-opacity', 1);

        // set opacity of buffers to 1
        this.buffersSelection
            .filter((d: NodeExt) => {
                return neighbors.includes(d.id);
            })
            .attr('fill-opacity', 1);


        // set opacity of edges to 1
        this.edgesSelection
            .filter((d: EdgeExt) => {
                return (neighbors.includes(d.source.id) && d.target.id == id) ||
                    (neighbors.includes(d.target.id) && d.source.id == id);
            })
            .attr('stroke-opacity', 1);

        // set opacity of texts to 1
        this.textsSelection
            .filter((d: NodeExt) => {
                return neighbors.includes(d.id);
            })
            .style('opacity', 1)
            .style('font-weight', 'bold');
    }

    mouseout() {
        // reset opacity
        this.nodesSelection
            .attr('fill-opacity', 1);

        this.edgesSelection
            .attr('stroke-opacity', 1);

        this.textsSelection
            .style('opacity', 1);
    }

    draw() {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#r-container').selectAll('g')
                    .attr('transform', $event.transform);
            });
        // set svg width and height
        const svg = d3.select('#r-container')
            .attr('width', this.width - this.margins.left - this.margins.right)
            .attr('height', this.height - this.margins.top - this.margins.bottom)
            .call(this.zoom.bind(this));

        // append g element and add zoom and drag to it 
        const g = svg.append('g')
            .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');
        // Initialize the links
        const edges = g.append('g')
            .attr('id', 'links');

        // TODO: Define ego 'center' node 
        

        this.edgesSelection = edges.selectAll('.link')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', d => this.color(1)) // TODO: Define d.hop from original code
            .attr('stroke-width', d => d.value);

        // Node Overlay (to space edges from nodes)
        const buffers = g.append('g')
            .attr('id', 'buffers')
            .attr('fill', 'white');

        this.buffersSelection = buffers.selectAll('.buffer')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'buffer')
            .attr('r', 9);

        // Guides
        const guides = g.append('g')
            .attr('id', 'guides')

        this.guidesSelection = guides.selectAll('.guide')
            .selectAll('.guide')
            .data(this.hops)
            .enter()
            .append('circle')
            .attr('stroke-width', 1)
            .attr('fill', 'transparent')
            .attr('class', 'guide')
            .attr('r', d => d * this.radius)
            .attr('stroke-dasharray', `5, 5`)
            .attr('stroke', 'rgba(0, 0, 0, 0.2)')
            .attr('cx', this.width / 2)
            .attr('cy', this.height / 2);
        // Initialize the nodes
        const nodes = g.append('g')
            .attr('id', 'nodes');

        this.nodesSelection = nodes.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', d => `node-${(d.id as string).replace('.', '')}`)
            .attr('r', 7)
            .attr('stroke', d => this.color(1)) // TODO: Define d.hop from original code
            .attr('fill', d => this.color(1)) // TODO: Define d.hop from original code
            .attr('fill-opacity', 1)
            .style('cursor', 'pointer')
            .on('mouseover', this.mouseover.bind(this))
            .on('mouseout', this.mouseout.bind(this));

        // Text
        const texts = g.append('g')
            .attr('id', 'labels');

        this.textsSelection = texts.selectAll('.label')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('id', d => `label-${d.id}`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '6pt')
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .style('opacity', 1)
            .text(d => Math.floor(Math.random() * 99))
        // .on('mouseover', this.mouseover.bind(this))
        // .on('mouseout', this.mouseout.bind(this));
        //.text(d => d.id)

        // Let's list the force we wanna apply on the network
        d3.forceSimulation<NodeExt>(this.nodes)
            .force('link',
                d3.forceLink<NodeExt, EdgeExt>()
                    // .strength(0.25)
                    .id((d: NodeExt) => d.id)
                    .links(this.edges)
            )
            .force('r', 
            d3.forceRadial(d => 1 * this.radius, this.width/2, this.height/2)
                .strength(5)
            )
            .force('charge',
                d3.forceManyBody()
                    .strength(-300))
            .force('center',
                d3.forceCenter(
                    (this.width) / 2.0,
                    (this.height) / 2.0))
            .on('end', this.ticked.bind(this));
    }

    ticked() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => d.source.x)
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => d.target.x)
            .attr('y2', (d: EdgeExt) => d.target.y);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.buffersSelection
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y);
    }
}
