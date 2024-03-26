import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Node, NodeExt, DataService, Edge, Cell, EdgeExt } from '../../services/data.service';
import { GlobalErrorHandler } from '../../services/error.service';
import { ColorService } from '../../services/color.util';
import { CONFIG } from '../../assets/config';
import { DATA_T_ONE } from '../../assets/miserables.7466811289384769737.2';
import { ResultsService } from 'src/services/results.service';
@Component({
    selector: 'app-m',
    templateUrl: './m.component.html',
    styleUrls: ['./m.component.scss']
})
export class MComponent implements AfterViewInit {
    private nodes: Array<NodeExt>;
    private edges: Array<EdgeExt>;

    // d3 selections
    private cellsSelection: d3.Selection<SVGRectElement, EdgeExt, any, any>;
    private rowsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;
    private colsSelection: d3.Selection<SVGTextElement, NodeExt, any, any>;
    private overlaySelection: d3.Selection<SVGRectElement, any, any, any>;
    private xAxiesSelection: d3.Selection<any, any, any, any>;
    private yAxiesSelection: d3.Selection<any, any, any, any>;
    private tooltipSelection: d3.Selection<SVGGElement, unknown, any, any>;

    // zoom 
    private zoom: d3.ZoomBehavior<Element, unknown>;

    constructor(private dataService: DataService, private resultsService: ResultsService, private errorService: GlobalErrorHandler, private colorService: ColorService) {
        const task = this.resultsService.getCurrentTask();

        if (task) {
            this.nodes = this.dataService.getDatasetNodes(task) as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges(task) as Array<EdgeExt>;
        } else {
            this.nodes = this.dataService.getDatasetNodes('t2') as Array<NodeExt>;
            this.edges = this.dataService.getDatasetEdges('t2') as Array<EdgeExt>;
        }

        this.nodes.sort((a: NodeExt, b: NodeExt) => {
            return a.hop - b.hop;
        });

        this.cellsSelection = d3.select('#m-container').selectAll('rect.node');
        this.rowsSelection = d3.select('#m-container').selectAll('text.label');
        this.colsSelection = d3.select('#m-container').selectAll('text.label');
        this.overlaySelection = d3.select('#m-container').selectAll('rect.overlay');
        this.xAxiesSelection = d3.select('#m-container').selectAll('g.x-axis');
        this.yAxiesSelection = d3.select('#m-container').selectAll('g.y-axis');

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
            .filter((d: EdgeExt) => d.source.toString().replace('.', '') === source || d.target.toString().replace('.', '') === target);

        cells
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', (d: EdgeExt) => (d.weight > 0 ? CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY : CONFIG.COLOR_CONFIG.NODE_OPACITY));

        // select current id and set opacity to 1
        d3.select(`#${id}`)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        // from xAxiesSelection select the current node and set font-weight to bold
        d3.select('#xaxis').selectAll('.tick')
            .each((d: any, i: number, nodes: any) => {
                // find and select the node with d 
                if (d.toString().replace('.', '') === source) {
                    d3.select(nodes[i])
                        .select('text')
                        .attr('font-weight', '800')
                        // .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
                        .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);
                }
            });

        d3.select('#yaxis').selectAll('.tick')
            .each((d: any, i: number, nodes: any) => {
                // find and select the node with d 
                if (d.toString().replace('.', '') === target) {
                    d3.select(nodes[i])
                        .select('text')
                        .attr('font-weight', '800')
                        // .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
                        .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);
                }
            });

        d3.select(`#node-circle-x${source}`)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT);

        d3.select(`#node-circle-y${target}`)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT);
        // .attr('font-weight', 'bold')
        // .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
        // .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        // get x and y position of the current cell
        const x = d3.select(`#${id}`).attr('x');
        const y = d3.select(`#${id}`).attr('y');

        // get width and height of the current cell
        const width = d3.select(`#${id}`).attr('width');
        const height = d3.select(`#${id}`).attr('height');

        // draw rectangle from x and y position to the end of the row and column
        const crosshair = d3.select('#m-container')
            .select('#matrix')
            .append('g')
            .attr('id', 'crosshair');

        crosshair.append('rect')
            .attr('x', x)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY);

        crosshair.append('rect')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT)
            .attr('height', height)
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.EDGE_OPACITY);

        crosshair.lower();

        // set all labels opacity to 0.1
        this.rowsSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);

        this.colsSelection
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY);

        // select all labels where source or target is the current node
        const labels = this.rowsSelection
            .filter((d: Node) => d.id.toString().replace('.', '') === source);

        labels
            .attr('font-weight', 'bold')
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);

        // select all labels where source or target is the current node
        const cols = this.colsSelection
            .filter((d: Node) => d.id.toString().replace('.', '') === target);

        cols
            .attr('font-weight', 'bold')
            .attr('fill', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT)
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_HIGHLIGHT_OPACITY);


        this.tooltipSelection
            .style('display', 'block')
            .raise();

        this.tooltipSelection.selectAll('rect')
            .attr('x', +x + 10)
            .attr('y', +y - 10);

        this.tooltipSelection.selectAll('text')
            .attr('x', +x + 15)
            .attr('y', +y + 5)
            .text(`Source: ${source} Target: ${target}`);
    }

    mouseout(): void {
        // remove crosshair
        d3.select('#crosshair').remove();

        // reset axis labels
        this.xAxiesSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.yAxiesSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        d3.selectAll('.node-circle-x')
            .attr('fill', (d: any) => this.colorService.getFill(d.hop));

        d3.selectAll('.node-circle-y')
            .attr('fill', (d: any) => this.colorService.getFill(d.hop));

        this.cellsSelection
            .attr('fill', (d: EdgeExt) => {
                return d.weight > 0 ? this.colorGradient(d.hop)(d.weight) : 'transparent';
            })
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.rowsSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.colsSelection
            .attr('font-weight', 'normal')
            .attr('fill', 'white')
            .attr('fill-opacity', CONFIG.COLOR_CONFIG.NODE_OPACITY_DEFAULT);

        this.tooltipSelection.style('display', 'none');
    }

    colorGradient(hop: number) {
        let color = this.colorService.getFill(hop);
        return d3.scaleLinear<string, string>().range(['#ffffff', color]).domain([0, 1]);
    }

    range(size: number, startAt: number = 0): Array<number> {
        return [...Array(size).keys()].map(i => i + startAt);
    }

    getEnds(orderedNodes: Array<Node>) {
        console.log(orderedNodes);
        let currentHop = 0;
        let currentLength = 0;
        let ends = new Array<any>();
        let start = orderedNodes[0].id;
        let end = orderedNodes[0].id;
        for (const node of orderedNodes) {
            const newHop = node.hop;
            if (newHop == currentHop) {
                currentLength++
            } else {
                ends.push({ 'startX': start, 'startY': start, 'end': end, 'hop': currentHop, 'height': currentLength, 'width': currentLength });
                start = node.id;
                currentHop = newHop;
                currentLength = 1;
            }
            end = node.id;
        };
        ends.push({ 'startX': start, 'startY': start, 'end': end, 'hop': currentHop, 'height': currentLength, 'width': currentLength });
        return ends;
    }

    getInbetweens(ends: Array<any>): Array<any> {
        if (ends.length < 2) {
            return ends;
        }
        for (const ind of this.range(ends.length - 1, 1)) {
            const inBetweenA = {
                'startX': ends[ind].startX, 'startY': ends[ind - 1].startY, 'hop': -1, 'height': ends[ind - 1].height, 'width': ends[ind].width
            };
            const inBetweenB = {
                'startX': ends[ind - 1].startX, 'startY': ends[ind].startY, 'hop': -1, 'height': ends[ind].width, 'width': ends[ind - 1].height
            };
            ends.push(inBetweenA, inBetweenB);
        }
        return ends;
    }

    draw(): void {
        // define zoom behavior 
        this.zoom
            .scaleExtent([0.1, 10])
            .on('zoom', ($event: any) => {
                d3.select('#m-container').selectAll('#matrix')
                    .attr('transform', $event.transform);
            });

        // set svg width and height
        const svg = d3.select('#m-container')
            .attr('width', CONFIG.WIDTH)
            .attr('height', CONFIG.HEIGHT)
            .call(this.zoom.bind(this));

        const g = svg.append('g')
            .attr('transform', 'translate(' + CONFIG.MARGINS.LEFT + ',' + CONFIG.MARGINS.TOP + ')');

        const inbetweens = this.getInbetweens(this.getEnds(this.nodes));

        const matrix = g.append('g')
            .attr('id', 'matrix');

        this.tooltipSelection = matrix.append('g').attr('id', 'tooltip');


        this.tooltipSelection
            .style('display', 'none')
            .style('pointer-events', 'none')
            .style('overflow', 'visible');

        this.tooltipSelection
            .append('rect')
            .attr('fill', 'white')
            .attr('fill-opacity', 0.7)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 130)
            .attr('height', 20);

        this.tooltipSelection
            .append('text')
            .attr('x', 5)
            .attr('y', 5)
            .attr('font-size', 12)
            .attr('fill', 'black')
            .attr('font-weight', 'bold')
            .text('Node');

        const x = d3.scaleBand()
            .domain(this.nodes.map((d: Node) => d.id.toString()))
            .range([0, CONFIG.WIDTH - CONFIG.MARGINS.LEFT - CONFIG.MARGINS.RIGHT])
            .padding(0.05);

        const y = d3.scaleBand()
            .domain(this.nodes.map((d: Node) => d.id.toString()))
            .range([0, CONFIG.HEIGHT - CONFIG.MARGINS.TOP - CONFIG.MARGINS.BOTTOM])
            .padding(0.05);

        const xAxis = d3.axisTop(x)
            .tickSizeOuter(0)
            .tickSizeInner(0);

        const yAxis = d3.axisLeft(y)
            .tickSizeOuter(0)
            .tickSizeInner(0);

        this.cellsSelection = matrix.selectAll('.node')
            .data(this.edges)
            .enter()
            .append('rect')
            .attr('class', 'node')
            .attr('id', (d: EdgeExt) => `cell-${(d.source as string).replace('.', '')}-${(d.target as string).replace('.', '')}`)
            .attr('x', (d: EdgeExt) => x(d.source.toString()) ?? 0)
            .attr('y', (d: EdgeExt) => y(d.target.toString()) ?? 0)
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('stroke', (d: EdgeExt) => this.colorService.getStroke(d.hop))
            .attr('stroke-opacity', 0.5)
            .attr('fill', (d: EdgeExt) => {
                return d.weight > 0 ? this.colorGradient(d.hop)(d.weight) : 'transparent';
            })
            .attr('rx', 2)
            .attr('ry', 2)
            .on('mouseover', this.mouseover.bind(this))
            .on('mouseout', this.mouseout.bind(this));

        const circlesX = matrix.selectAll('.node-circle-x')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node-circle-x')
            .attr('id', (d: Node) => `node-circle-x${d.id}`)
            .attr('cx', (d: Node) => (x(d.id.toString()) || 0) + x.bandwidth() / 2)
            .attr('cy', -10)
            .attr('r', 6)
            .attr('fill', (d: Node) => this.colorService.getFill(d.hop));

        const circlesY = matrix.selectAll('.node-circle-y')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node-circle-y')
            .attr('id', (d: Node) => `node-circle-y${d.id}`)
            .attr('cx', -10)
            .attr('cy', (d: Node) => (y(d.id.toString()) || 0) + y.bandwidth() / 2)
            .attr('r', 6)
            .attr('fill', (d: Node) => this.colorService.getFill(d.hop));

        const axisX = matrix.append('g')
            .attr('id', 'xaxis')
            .style('font-size', '6pt')
            .attr('transform', `translate(6, -5)`)
            .call(xAxis)

        this.xAxiesSelection = axisX
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
        // .attr('transform', 'rotate(-65)')

        axisX.select('.domain')
            .remove();

        const axisY = matrix.append('g')
            .attr('id', 'yaxis')
            .style('font-size', '6pt')
            .attr('transform', `translate(-1, 2)`)
            .call(yAxis)

        this.yAxiesSelection = axisY
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('dx', '-.8em')
            .attr('dy', '.15em');

        axisY.select('.domain')
            .remove();

        const overlay = matrix.append('g')
            .attr('id', 'overlay');

        this.overlaySelection = overlay.selectAll('.overlay')
            .data(inbetweens)
            .enter()
            .append('rect')
            .attr('class', 'overlay')
            .attr('x', (d: any) => x(d.startX) ?? 0)
            .attr('y', (d: any) => y(d.startY) ?? 0)
            .attr('width', (d: any) => d.width * 1.05 * x.bandwidth())
            .attr('height', (d: any) => d.height * 1.05 * y.bandwidth())
            .attr('fill', 'transparent')
            .attr('stroke', (d: any) => this.colorService.getStroke(d.hop))
            .attr('stroke-width', CONFIG.SIZE_CONFIG.CELL_STROKE)
            .attr('stroke-dasharray', (d: any) => {
                return d.hop < 0 ? '5,5' : 'none';
            })
            .attr('rx', 2)
            .attr('ry', 2)
            .style('pointer-events', 'none');
    }
}
