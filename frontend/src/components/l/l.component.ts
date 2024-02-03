import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, NodeExt, Edge, EdgeExt, DataService } from '../../services/data.service';
import { CONFIG } from '../../assets/config';
import { GlobalErrorHandler } from '../../services/error.service';
import { ColorService } from '../../services/color.util';
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
    private nodesSelection: d3.Selection<SVGCircleElement,NodeExt, any, any>;
    private edgesSelection: d3.Selection<SVGLineElement, EdgeExt, any, any>;
    private guidesSelection: d3.Selection<SVGLineElement, number, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private errorService: GlobalErrorHandler, private colorService: ColorService) {
        this.nodes = this.dataService.getDatasetNodes('layered') as Array<NodeExt>;
        this.edges = this.dataService.getDatasetEdges('layered') as Array<EdgeExt>;
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

        d3.select(`#label-${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY)
            .style('font-weight', 'bold');

        // find targets or sourcdes of current node in this.edges
        const neighbors = new Array<string | number>();
        
        this.edges.forEach((d: EdgeExt) => {
            if(d.source.id.toString().replace('.', '') === id) {
                neighbors.push(d.target.id.toString().replace('.', ''));
            } 
            if(d.target.id.toString().replace('.', '') === id) {
                neighbors.push(d.source.id.toString().replace('.', ''));
            }
        });

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
                // check if source or target is in neighbors or if source or target are the current node
                return neighbors.includes(d.source.id.toString().replace('.', '')) || neighbors.includes(d.target.id.toString().replace('.', ''));
            })
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
    }

    mouseout() {
        // reset opacity
        this.nodesSelection
            .attr('fill', CONFIG.COLOR_CONFIG.NODE)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.edgesSelection
            .attr('stroke', CONFIG.COLOR_CONFIG.EDGE_STROKE)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY_DEFAULT);

        this.textsSelection
            .attr('font-weight', 'normal')
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);
    }

    draw(): void {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#L-container').selectAll('g')
                    .attr('transform', $event.transform);
            });

        const svg = d3.select('#l-container')
            .attr('width', CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('height', CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM)
            .call(this.zoom.bind(this));

        const g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');
        
        const link = g.append('g')
            .attr('class', 'links');

        this.edgesSelection = link
            .selectAll('line')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-width', (d: EdgeExt) => this.weightMin/3 + d.weight);
        
        const guides = g.append('g')
            .attr('class', 'guides');

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
            .attr('x2', CONFIG.WIDTH)
            .attr('y2', (d: number) => d * 200);

        const node = g.append('g')
            .attr('class', 'nodes');
        
        this.nodesSelection = node
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('id', (d: NodeExt) => `node-${d.id}`)
            .attr('r', CONFIG.SIZE_CONFIG.NODE)
            .attr('fill', (d: NodeExt) => this.colorService.getFill(d.hop))
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY)
            .attr('stroke', (d: NodeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-width', 1)
            .attr('pointer-events', 'all')
            .on('mouseover', this.mouseover.bind(this))
            .on('mouseout', this.mouseout.bind(this));

        const label = g.append('g')
            .attr('class', 'labels');

        this.textsSelection = label
            .selectAll('text')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('id', (d: NodeExt) => `label-${d.id}`)
            .text((d: NodeExt) => d.id)
            .attr('fill', CONFIG.COLOR_CONFIG.LABEL)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY)
            .attr('font-size', CONFIG.SIZE_CONFIG.LABEL)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('pointer-events', 'none');

        // simulation
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
                .strength(-300)
            )
            .on('end', this.ticked.bind(this));
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

        console.log(this.nodes);
        console.log(this.edges);

        this.textsSelection
            .attr('x', (d: NodeExt) => d.x)
            .attr('y', (d: NodeExt) => d.y)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.LABEL_OPACITY_DEFAULT);
    }
}
