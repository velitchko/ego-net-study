import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-r',
    templateUrl: './r.component.html',
    styleUrls: ['./r.component.scss']
})
export class RComponent implements OnInit {
    @Input() data: any = [];
    @Input() width: number = 960;
    @Input() height: number = 600;

    constructor() { }

    ngOnInit(): void {
        this.draw();
    }

    draw() {
        // set svg width and height
        const svg = d3.select('#r-container')
            .attr('width', this.width)
            .attr('height', this.height);

        // draw rect
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'yellow');
    }
}
