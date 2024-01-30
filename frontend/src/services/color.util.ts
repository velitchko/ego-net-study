import { Injectable } from '@angular/core';
import { CONFIG } from '../assets/config';
@Injectable({
    providedIn: 'root'
})

export class ColorService {
    private colorFill: Map<number, string>;
    private colorStroke: Map<number, string>;

    constructor() {
        this.colorFill = new Map<number, string>([
            [-1, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['-1']],
            [0, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['0']],
            [1, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['1']],
            [2, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['2']],
            [3, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['3']],
            [4, CONFIG.COLOR_CONFIG.EGO_HOPS_FILL['4']]

        ]);
        
        this.colorStroke = new Map<number, string>([
            [-1, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['-1']],
            [0, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['0']],
            [1, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['1']],
            [2, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['2']],
            [3, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['3']],
            [4, CONFIG.COLOR_CONFIG.EGO_HOPS_STROKE['4']]
        ]);
    }

    getFill(hop: number): string {
        return this.colorFill.get(hop) || CONFIG.COLOR_CONFIG.NODE_FILL;
    }

    getStroke(hop: number): string {
        return this.colorStroke.get(hop) || CONFIG.COLOR_CONFIG.NODE_STROKE;
    }

}
