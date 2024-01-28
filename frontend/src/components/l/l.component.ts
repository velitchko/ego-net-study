import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, NodeExt, Edge, EdgeExt, DataService } from '../../services/data.service';
import { CONFIG } from '../../assets/config';
import { GlobalErrorHandler } from '../../services/error.service';
@Component({
    selector: 'app-l',
    templateUrl: './l.component.html',
    styleUrls: ['./l.component.scss']
})
export class LComponent implements OnInit {
    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;
    private hops = [1, 2, 3, 4, 5];
    private radius = 50;

    // d3 selections
    private nodesSelection: d3.Selection<SVGCircleElement, d3.HierarchyNode<NodeExt>, any, any>;
    private edgesSelection: d3.Selection<SVGPathElement, d3.HierarchyLink<NodeExt>, any, any>;
    private guidesSelection: d3.Selection<SVGCircleElement, any, any, any>;
    private textsSelection: d3.Selection<SVGTextElement, d3.HierarchyNode<NodeExt>, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private errorService: GlobalErrorHandler) {
        this.nodes = this.dataService.getNodes() as Array<NodeExt>;
        this.edges = this.dataService.getEdges() as Array<EdgeExt>;

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
            .filter((d: d3.HierarchyNode<NodeExt>) => {
                // console.log(d)
                return neighbors.includes(d.data.id.toString().replace('.', ''));
            })
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);
        
        // set opacity of edges to 1
        this.edgesSelection
            .filter((d: d3.HierarchyLink<NodeExt>) => {
                // check if source or target is in neighbors or if source or target are the current node
                return neighbors.includes(d.source.data.id.toString().replace('.', '')) || neighbors.includes(d.target.data.id.toString().replace('.', ''));
            })
            .attr('stroke', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('stroke-opacity', CONFIG.COLOR_CONFIG.EDGE_HIGHILIGHT_OPACITY);

        // set opacity of texts to 1
        this.textsSelection
            .filter((d: d3.HierarchyNode<NodeExt>) => {
                return neighbors.includes(d.data.id.toString().replace('.', ''));
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
                d3.select('#r-container').selectAll('g')
                    .attr('transform', $event.transform);
            });

        const svg = d3.select('#l-container')
            .attr('width', CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('height', CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM)
            .call(this.zoom.bind(this));

        const g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');

        const root = d3.stratify<NodeExt>()
            .id((d: any) => d.id)
            .parentId((d: any) => d.parent)
            (this.nodes);

        const dx = 10;
        const dy = CONFIG.WIDTH / (root.height + 1);

        const tree = d3.tree<NodeExt>().nodeSize([dx, dy]);
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

        const pathGenerator = d3.linkHorizontal<d3.HierarchyLink<NodeExt>, d3.HierarchyNode<NodeExt>>()
            .x((d: d3.HierarchyNode<NodeExt>) => d.data.y)
            .y((d: d3.HierarchyNode<NodeExt>) => d.data.x);
        
        this.edgesSelection = edges.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'link')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5)
            .attr('d', (d: d3.HierarchyLink<NodeExt>) => pathGenerator(d));

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
            .attr('transform', (d: d3.HierarchyNode<NodeExt>) => `translate(${d.data.y},${d.data.x})`);

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
            .text((d: d3.HierarchyNode<NodeExt>) => d.data.id)
            .clone(true).lower()
            .attr('stroke', 'white');
    }
}
