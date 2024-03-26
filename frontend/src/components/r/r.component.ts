import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, Edge, DataService } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { CONFIG } from '../../assets/config';
import { ColorService } from '../../services/color.util';
import { ResultsService } from '../../services/results.service';

type NodeExt = Node & { x: number, y: number };
type EdgeExt = Edge & { source: NodeExt, target: NodeExt };

@Component({
    selector: 'app-r',
    templateUrl: './r.component.html',
    styleUrls: ['./r.component.scss']
})
export class RComponent implements OnInit {
    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;
    private hops: Array<number>;
    private hopMax: number;
    private radius: number;
    private weightMin: number;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, NodeExt, any, any>;
    private edgesSelection: d3.Selection<SVGLineElement, EdgeExt, any, any>;
    private guidesSelection: d3.Selection<SVGCircleElement, number, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;
    private tooltipSelection: d3.Selection<SVGGElement, unknown, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private resultsService: ResultsService, private errorService: GlobalErrorHandler, private colorService: ColorService) {
        const task = this.resultsService.getCurrentTask();

        if (task) {
            this.nodes = this.dataService.getDatasetNodes(task) as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges(task) as Array<EdgeExt>;
        } else {
            this.nodes = this.dataService.getDatasetNodes('t1') as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges('t1') as Array<EdgeExt>;
        }

        this.hops = this.nodes.map((d: NodeExt) => d.hop);
        this.hopMax = Math.max(...this.hops);
        this.radius = Math.min(CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT, CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM) / (2 * this.hopMax);
        this.weightMin = d3.min(this.nodes.map((d: NodeExt) => d.weight)) || 0;

        this.nodesSelection = d3.select('#r-container').selectAll('circle.node');
        this.edgesSelection = d3.select('#r-container').selectAll('line.link');
        this.guidesSelection = d3.select('#r-container').selectAll('circle.guide');
        this.textsSelection = d3.select('#r-container').selectAll('text.label');

        this.zoom = d3.zoom();
    }

    ngOnInit(): void {
        try {
            this.draw();
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    mouseover($event: MouseEvent) {
        // highlight node and its edges
        // get id of currently selected node
        const id = ($event.target as any).id.replace('node-', '');

        // set opacity of all no    des to 0.1
        this.nodesSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);

        // set opacity of all edges to 0.1
        this.edgesSelection
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY);

        // set opacity of all texts to 0.1
        this.textsSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);

        // set opacity of current node to 1
        d3.select(`#node-${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        const x = d3.select(`#node-${id}`).attr('cx');
        const y = d3.select(`#node-${id}`).attr('cy');

        d3.select(`#label-${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY)
            .style('font-weight', 'bold');

        // find targets or sourcdes of current node in this.edges
        const neighbors = new Array<string | number>();

        if (!CONFIG.PRECOMPUTED) {
            this.edges.forEach((d: EdgeExt) => {
                if (d.source.id.toString().replace('.', '') === id) {
                    neighbors.push(d.target.id.toString().replace('.', ''));
                }
                if (d.target.id.toString().replace('.', '') === id) {
                    neighbors.push(d.source.id.toString().replace('.', ''));
                }
            });
        } else {
            this.edges.forEach((d: EdgeExt) => {
                if (d.source.toString().replace('.', '') === id) {
                    neighbors.push(d.target.toString().replace('.', ''));
                }
                if (d.target.toString().replace('.', '') === id) {
                    neighbors.push(d.source.toString().replace('.', ''));
                }
            });
        }

        // set opacity of nodes to 1
        this.nodesSelection
            .filter((d: NodeExt) => {
                // console.log(d)
                return neighbors.includes(d.id.toString().replace('.', ''));
            })
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        // set opacity of edges to 1
        this.edgesSelection
            .filter((d: EdgeExt) => {
                if (!CONFIG.PRECOMPUTED) {
                    return (neighbors.includes(d.source.id.toString().replace('.', '')) && d.target.id.toString().replace('.', '') == id) ||
                        (neighbors.includes(d.target.id.toString().replace('.', '')) && d.source.id.toString().replace('.', '') == id);
                } else {
                    return (neighbors.includes(d.source.toString().replace('.', '')) && d.target.toString().replace('.', '') == id) ||
                        (neighbors.includes(d.target.toString().replace('.', '')) && d.source.toString().replace('.', '') == id);
                }
            })
            .attr('stroke', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('stroke-width', 2)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_HIGHILIGHT_OPACITY);

        // set opacity of texts to 1
        this.textsSelection
            .filter((d: NodeExt) => {
                return neighbors.includes(d.id.toString().replace('.', ''));
            })
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY)
            .style('font-weight', 'bold');

        this.tooltipSelection
            .style('display', 'block')
            .raise();

        this.tooltipSelection.selectAll('rect')
            .attr('x', +x + 10)
            .attr('y', +y - 10);

        this.tooltipSelection.selectAll('text')
            .attr('x', +x + 15)
            .attr('y', +y + 5)
            .text(`Node: ${id}`);
    }

    mouseout() {
        // reset opacity
        this.nodesSelection
            .attr('fill', (d: NodeExt) => this.colorService.getFill(d.hop))
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.edgesSelection
            .attr('stroke-width', (d: EdgeExt) => this.weightMin / 3 + d.weight)
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);


        this.textsSelection
            .attr('font-weight', 'normal')
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.tooltipSelection.style('display', 'none');
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
            .attr('width', CONFIG.WIDTH)
            .attr('height', CONFIG.HEIGHT)
            .call(this.zoom.bind(this));

        // append g element and add zoom and drag to it 
        const g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');
        
        this.tooltipSelection = g.append('g').attr('id', 'tooltip');

        this.tooltipSelection
            .style('display', 'none')
            .style('pointer-events', 'none');

        this.tooltipSelection
            .append('rect')
            .attr('fill', 'white')
            .attr('fill-opacity', 0.7)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 60)
            .attr('height', 20);

        this.tooltipSelection
            .append('text')
            .attr('x', 5)
            .attr('y', 5)
            .attr('font-size', 12)
            .attr('fill', 'black')
            .attr('font-weight', 'bold')
            .text('Node');
        // Initialize the links
        const edges = g.append('g')
            .attr('id', 'links');

        this.edgesSelection = edges.selectAll('.link')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('stroke-width', (d: EdgeExt) => this.weightMin / 3 + d.weight)
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
        // Guides
        const guides = g.append('g')
            .attr('id', 'guides')

        this.guidesSelection = guides
            .selectAll('circle')
            .data(this.hops)
            .enter()
            .append('circle')
            .attr('stroke-width', 1)
            .attr('fill', 'transparent')
            .attr('class', 'guide')
            .attr('r', (d: number) => d * this.radius)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5, 5')
            .attr('stroke', 'gray')
            .attr('cx', (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT) / 2)
            .attr('cy', (CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM) / 2);

        const nodes = g.append('g')
            .attr('id', 'nodes');

        this.nodesSelection = nodes.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', (d: NodeExt) => `node-${d.id.toString().replace('.', '')}`)
            .attr('r', 7)
            .attr('stroke', (d: NodeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-opacity', 0)
            .attr('stroke-width', CONFIG.SIZE_CONFIG.NODE_STROKE)
            .attr('fill', (d: NodeExt) => this.colorService.getFill(d.hop))
            .attr('fill-opacity', 0)
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
            .attr('id', (d: NodeExt) => `label-${d.id.toString().replace('.', '')}`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', CONFIG.SIZE_CONFIG.LABEL_SIZE)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', 0)
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .text(d => d.id);
        // .on('mouseover', this.mouseover.bind(this))
        // .on('mouseout', this.mouseout.bind(this));
        //.text(d => d.id)

        // Let's list the force we wanna apply on the network
        if (!CONFIG.PRECOMPUTED) {
            d3.forceSimulation<NodeExt>(this.nodes)
                .force('link',
                    d3.forceLink<NodeExt, EdgeExt>()
                        // .strength(0.25)
                        .id((d: NodeExt) => d.id)
                        .links(this.edges)
                )
                .force('r',
                    d3.forceRadial((d: NodeExt) => d.hop * this.radius, (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT) / 2, (CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM) / 2)
                        .strength(5)
                )
                .force('charge',
                    d3.forceManyBody()
                        .strength(-400))
                .force('center',
                    d3.forceCenter(
                        (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT) / 2.0,
                        (CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM) / 2.0)
                )
                .on('end', this.ticked.bind(this));
        } else {
            this.layout();
        }
    }

    layout() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => d.x1 || 0)
            .attr('y1', (d: EdgeExt) => d.y1 || 0)
            .attr('x2', (d: EdgeExt) => d.x2 || 0)
            .attr('y2', (d: EdgeExt) => d.y2 || 0)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.LABEL_OPACITY_DEFAULT);
    }

    ticked() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => d.source.x)
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => d.target.x)
            .attr('y2', (d: EdgeExt) => d.target.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => d.x)
            .attr('cy', (d: NodeExt) => d.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);
    }
}
