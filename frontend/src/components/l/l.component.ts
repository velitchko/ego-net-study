import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, NodeExt, Edge, EdgeExt, DataService } from '../../services/data.service';
import { CONFIG } from '../../assets/config';
import { GlobalErrorHandler } from '../../services/error.service';
import { ColorService } from '../../services/color.util';
import { ResultsService } from '../../services/results.service';
@Component({
    selector: 'app-l',
    templateUrl: './l.component.html',
    styleUrls: ['./l.component.scss']
})
export class LComponent implements OnInit {
    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;
    private hops: Array<number>;
    private weightMin: number;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, NodeExt, any, any>;
    private edgesSelection: d3.Selection<SVGLineElement, EdgeExt, any, any>;
    private guidesSelection: d3.Selection<SVGLineElement, number, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;
    private tooltipSelection: d3.Selection<SVGGElement, unknown, any, any>;

    private w: number | undefined; // Width of the container

    private task = '';

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private resultsService: ResultsService, private errorService: GlobalErrorHandler, private colorService: ColorService) {
        this.task = this.resultsService.getCurrentTask();
        
        if(this.task) {
            this.nodes = this.dataService.getDatasetNodes(this.task) as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges(this.task) as Array<EdgeExt>;
        } else {
            this.task = 'tutorial';
            this.nodes = this.dataService.getDatasetNodes('t1') as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges('t1') as Array<EdgeExt>;
        } 

        this.hops = Array.from(new Set(this.nodes.map((d: NodeExt) => d.hop)));
        this.weightMin = d3.min(this.nodes.map((d: NodeExt) => d.weight)) || 0;

        this.nodesSelection = d3.select('#l-container').selectAll('circle.node');
        this.edgesSelection = d3.select('#l-container').selectAll('line.link');
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
            .attr('stroke-width', 2)
            .attr('stroke', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
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
            .attr('stroke-width', (d: EdgeExt) => 0.1 + (this.weightMin + d.weight))
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);


        this.textsSelection
            .attr('font-weight', 'normal')
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.tooltipSelection.style('display', 'none');
    }

    draw(): void {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#l-container').select('#wrapper')
                    .attr('transform', $event.transform);
            });
        
        // get width of #dthree container
        this.w = document?.getElementById('dthree')?.offsetWidth;
        
        const svg = d3.select('#l-container')
            .attr('width', (this.w ? this.w : CONFIG.WIDTH) - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('height', CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM)
            .call(this.zoom.bind(this));

        const g = svg.append('g')
        .attr('id', 'wrapper')
        .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');

        const link = g.append('g')
            .attr('id', 'links');

        this.edgesSelection = link
            .selectAll('line')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-width', (d: EdgeExt) => 0.1 + (this.weightMin + d.weight))
            .attr('stroke-opacity', 0);

        const guides = g.append('g')
            .attr('id', 'guides');

        this.guidesSelection = guides
            .selectAll('line')
            .data(this.hops)
            .enter()
            .append('line')
            .attr('class', 'guide')
            .attr('stroke-dasharray', '5,5')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')
            .attr('x1', 0)
            .attr('y1', (d: number) => d * 200)
            .attr('x2', (this.w ? this.w : CONFIG.WIDTH) - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('y2', (d: number) => d * 200);

        const node = g.append('g')
            .attr('id', 'nodes');

        this.nodesSelection = node
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', (d: NodeExt) => `node-${d.id}`)
            .attr('r', CONFIG.SIZE_CONFIG.NODE)
            .attr('fill', (d: NodeExt) => this.colorService.getFill(d.hop))
            .attr('fill-opacity', 0)
            .attr('stroke', (d: NodeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0)
            .attr('pointer-events', 'all')
            .on('mouseover', this.mouseover.bind(this))
            .on('mouseout', this.mouseout.bind(this));

        const label = g.append('g')
            .attr('id', 'labels');

        this.textsSelection = label
            .selectAll('text')
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
            .text((d: NodeExt) => d.id);

        // simulation
        if (!CONFIG.PRECOMPUTED) {
            d3.forceSimulation<Node>(this.nodes)
                .force('link',
                    d3.forceLink<NodeExt, EdgeExt>()
                        .strength(0.1)
                        .id((d: NodeExt) => d.id)
                        .links(this.edges)
                )
                .force('linear',
                    d3.forceY((d: NodeExt) => d.hop * 200)
                        .strength(3)
                )
                .force('charge',
                    d3.forceManyBody()
                        .strength(-200)
                )
                .on('end', this.ticked.bind(this));

                console.log(this.nodes);
        } else {
            this.layout();
        }
    }

    layout() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => this.nodes.find((n: NodeExt) => n.id === d.source)?.lx || 0)
            .attr('y1', (d: EdgeExt) => this.nodes.find((n: NodeExt) => n.id === d.source)?.ly || 0)
            .attr('x2', (d: EdgeExt) => this.nodes.find((n: NodeExt) => n.id === d.target)?.lx || 0)
            .attr('y2', (d: EdgeExt) => this.nodes.find((n: NodeExt) => n.id === d.target)?.ly || 0)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => d.lx || 0)
            .attr('cy', (d: NodeExt) => d.ly || 0)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.lx || 0)
            .attr('y', (d: NodeExt) => d.ly || 0)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.LABEL_OPACITY_DEFAULT);

        const bbox = (d3.select('#nodes').node() as any)?.getBBox();

        let trans = ((this.w ? this.w : CONFIG.WIDTH) - (bbox.width/2 + CONFIG.MARGINS.LEFT + CONFIG.MARGINS.RIGHT))/2;

        
        this.tooltipSelection = d3.select('#wrapper').append('g').attr('id', 'tooltip');

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

        d3.select('#nodes').attr('transform', `translate(${trans}, 0)`);
        d3.select('#labels').attr('transform', `translate(${trans}, 0)`);
        d3.select('#links').attr('transform', `translate(${trans}, 0)`);
        d3.select('#tooltip').attr('transform', `translate(${trans}, 0)`);
    }

    ticked() {
        this.edgesSelection
            .attr('x1', (d: EdgeExt) => (d.source.x) + (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT))
            .attr('y1', (d: EdgeExt) => d.source.y)
            .attr('x2', (d: EdgeExt) => (d.target.x) + (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT))
            .attr('y2', (d: EdgeExt) => d.target.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.nodesSelection
            .attr('cx', (d: NodeExt) => (d.x) + (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT))
            .attr('cy', (d: NodeExt) => d.y)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('x', (d: NodeExt) => (d.x) + (CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT))
            .attr('y', (d: NodeExt) => d.y)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.LABEL_OPACITY_DEFAULT);
    }
}
