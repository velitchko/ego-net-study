export const CONFIG = {
    WIDTH: 1000,
    HEIGHT: 1000,
    API_BASE: 'http://localhost:8080/',
    COLOR_CONFIG: {
        NODE: '#0000ff',
        EDGE: '#000000',
        EDGE_HIGHLIGHT: '#ff0000',
        NODE_HIGHLIGHT: '#ff0000',
        LABEL_HIGHLIGHT: '#ffffff',
        NODE_OPACITY_DEFAULT: 1,
        EDGE_OPACITY_DEFAULT: 1,
        NODE_OPACITY: 0.1,
        EDGE_OPACITY: 0.1,
        NODE_HIGHLIGHT_OPACITY: 1,
        EDGE_HIGHLIGHT_OPACITY: 1,
        NODE_STROKE: '#000000',
        EDGE_STROKE: '#000000',
        LABEL: '#ffffff',
        EGO_HOPS_FILL: {
            '-1': '#000000',
            '0': '#000000',
            '1': '#66c2a5',
            '2': '#fc8d62',
            '3': '#8da0cb'
            // '1': '#a6cee3',
            // '2': '#1f78b4',
            // '3': '#b2df8a',
            // '4': '#33a02c',
        },
        EGO_HOPS_STROKE: {
            '-1': '#000000',
            '0': '#000000',
            '1': '#66c2a5',
            '2': '#fc8d62',
            '3': '#8da0cb'
            // '1': '#a6cee3',
            // '2': '#1f78b4',
            // '3': '#b2df8a',
            // '4': '#33a02c',
        },
    },
    SIZE_CONFIG: {
        NODE: 8,
        EDGE: 1,
        NODE_STROKE: 1,
        EDGE_STROKE: 1,
        CELL_STROKE: 1,
        CELL_SIZE: 10,
        LABEL_SIZE: 8,
    },
    MARGINS: {
        TOP: 20,
        RIGHT: 20,
        BOTTOM: 20,
        LEFT: 20
    }
}