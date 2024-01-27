// setup node-link component 

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-r',
    templateUrl: './r.component.html',
    styleUrls: ['./r.component.scss']
})
export class RComponent implements OnInit, OnChanges {
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

    }
}
