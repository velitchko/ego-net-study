// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SURVEY_JSON } from '../assets/survey.js';
import { CONFIG } from '../assets/config';

type QualitativeAnswer = {
    learn: number,
    use: number,
    aesth: number,
    acc: number,
    quick: number,
    comments: string
};

type DemographicAnswer = {
    prolificId: string,
    gender: string,
    ageGroup: string,
    education: string,
    familiarity: string
};

type AgreementAnswer = {
    confirm: string,
    agreement: string
};

// export type Params = {
//     user: string,
//     egoNetApproaches: Array<string>,
//     taskCode: string,
//     taskDescription: string
// };


export type Params = {
    user: string,
    egoNetApproach: string,
    taskCodes: Array<string>,
    taskDescriptions: Array<string>
};

export type Result = { 
    index: number,
    time: number, 
    task: string, 
    representation: string, 
    answer: string | number | QualitativeAnswer | DemographicAnswer | AgreementAnswer
} | {
    index: number,
    time: number,
    order: Array<string>,
    task?: string,
    reprentation: string,
};
@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private params: Params | null;
    private taskCounter: number = 0;

    protected questionMap: Map<string, string> = new Map([
        ['matrix', 'm-question'],
        ['nodelink', 'nl-question'],
        ['layered', 'l-question'],
        ['radial', 'r-question']
    ]);

    protected titleMap: Map<string, string> = new Map([
        ['matrix', 'Matrix'],
        ['nodelink', 'Node-Link'],
        ['layered', 'Layered'],
        ['radial', 'Radial']
    ]);

    protected taskInputType: Map<string, string> = new Map([
        ['t1', 'number'],
        ['t2', 'text'],
        ['t3', 'number'],
        ['t4', 'number'],
        ['t5', 'number'],
        ['t6', 'text']
    ]);

    protected tutorialRepresenation: Map<string, string> = new Map([
        ['matrix', `
            <p style="padding-bottom: .5em;">
            Adjacency matrix representations of ego networks display the connectivity between entities tabularly. <b>Each entity, i.e. node, is represented twice</b>, once as a labeled row, and once as a labeled column. If a connection, i.e. an edge, exists between two nodes the corresponding matrix cell is “filled”. This means that <b>each edge is represented twice as well</b>. For example, if an edge connects nodes 3 and 5, then the matrix cells at locations (3,5) and (5,3) are filled in. Don’t count these twice though - this is still just one edge. 
            </p>
            <p style="padding-bottom: .5em;">
            The <b>ego of a particular ego network will always be represented at the top left</b> of the matrix table (in the example below node #34). Alters are arranged in colored blocks depending on their proximity to the ego. That is to say that, after the ego, the first colored block consists of 1-alters, the second of 2-alters, and so forth. The nodes of each block are displayed along the columns and rows and are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink.
            </p>
            <p style="padding-bottom: .5em;">
            <b>Intra-alter edges connect two nodes of the same alter level, i.e. connections within a block</b>, and (like the alters themselves) are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. <b>Inter-alter edges connect two nodes of different alter levels, i.e. connections between colored blocks</b>, and are colored in black. <b>The darker a cell is colored, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            <b>The visualization is interactive</b>. You can click and drag in order to pan, and you can zoom in and out using your scroll wheel. By hovering over a node you can see its connections and neighbors.
            </p>
        `],
        ['nodelink', `
            <p style="padding-bottom: .5em;">
            The node-link diagram is the most common form of network representation. In it, each entity, i.e. <b>node, is represented as a circle</b>, whose label is positioned at the circle’s center. A relationship, i.e. an <b>edge, connecting two particular nodes is drawn as a straight line between them. The darker the line, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            The ego, in the example below node #34, of a particular network is colored black. Alters are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink.
            </p>
            <p style="padding-bottom: .5em;">
            <b>Intra-alter edges connect two nodes of the same alter level</b>, and (like the alters themselves) are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. <b>Inter-alter edges connect two nodes of different alter levels</b> and are colored in black. <b>The thicker the line, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            <b>The visualization is interactive</b>. You can click and drag in order to pan, and you can zoom in and out using your scroll wheel. By hovering over a node you can see its connections and neighbors.
            </p>
        `],
        ['layered', `
            <p style="padding-bottom: .5em;">
            In a layered node-link diagram, each entity, i.e. <b>node, is represented as a circle</b> with its label positioned at the circle’s center. A relationship, i.e. an <b>edge, connecting two particular nodes is drawn as a straight line</b> between them. <b>The darker the line, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            The network’s ego, in the example below node #34, is positioned at the top of the diagram, colored in black. <b>Each alter-level has its nodes distributed along the corresponding horizontal line</b>: the ego along the first line, 1-alters along the second, 2-alters along the third, and so on.
            </p>
            <p style="padding-bottom: .5em;">
            <b>Intra-alter edges connect two nodes of the same alter level, i.e. connect nodes within an alter-line</b>, and (like the alters themselves) are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. <b>Inter-alter edges connect two nodes of different alter levels, i.e. connect nodes between alter-lines</b> and are colored in black. <b>The thicker the line, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            <b>The visualization is interactive</b>. You can click and drag in order to pan, and you can zoom in and out using your scroll wheel. By hovering over a node you can see its connections and neighbors.
            </p>
        `],
        ['radial', `
            <p style="padding-bottom: .5em;">
            In a radial node-link diagram, each entity, i.e. <b>node, is represented as a circle</b> with its label positioned at the circle’s center. A relationship, i.e. an <b>edge, connecting two particular nodes is drawn as a straight line between them</b>. The darker the line, the stronger the edge connecting two nodes is.
            </p>
            <p style="padding-bottom: .5em;">
            The network’s ego, in the example below node #34, is positioned at the center of the diagram, colored in black. <b>Alters are placed along concentric circles around the ego</b>, i.e. 1-alters are placed along the first ring, 2-alters along the second, and so on. Alters are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink.
            </p>
            <p style="padding-bottom: .5em;">
            <b>Intra-alter edges connect two nodes of the same alter level, i.e. nodes on the same ring</b>, and (like the alters themselves) are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. <b>Inter-alter edges connect two nodes of different alter levels, i.e. nodes on different rings</b>, and are colored in black. <b>The thicker the line, the stronger the edge connecting two nodes is.</b>
            </p>
            <p style="padding-bottom: .5em;">
            <b>The visualization is interactive</b>. You can click and drag in order to pan, and you can zoom in and out using your scroll wheel. By hovering over a node you can see its connections and neighbors.
            </p>
        `]
    ]);

    protected captionRepresenation: Map<string, string> = new Map([
        ['matrix', 'Caption: The same network is represented once as a node-link diagram (left) and adjacency matrix (right). Note how the edges in the node-link diagram, i.e. the lines, become filled matrix cells in the adjacency matrix representation. Also, note how both nodes and subsequently edges are represented twice.'],
        ['nodelink', 'Caption: A node-link diagram representation of an ego network. Note the ego\'s black color, and the various alter levels\' colors'],
        ['layered', 'Caption: The same network represented once as a node-link diagram (left) and radial node-link diagram (right). Note the placement of the nodes along the layered lines.'],
        ['radial', 'Caption: The same network represented once as a node-link diagram (left) and radial node-link diagram (right). Note the placement of the nodes along the concentric circles.']
    ]);

    private surveySetup: boolean = false;

    private results: Array<Result> = new Array<Result>();

    constructor(private http: HttpClient) {
        this.params = null;
    }

    setUserParams(params: Params): void {
        this.params = params;
        this.params.taskCodes.unshift('tutorial');
        this.params.taskDescriptions.unshift('');

        // add metadata to results
        this.results.push({
            index: -99,
            time: 0,
            order: this.params.taskCodes,
            reprentation: this.params.egoNetApproach
        });
    }

    getUserParams(): Params | null {
        return this.params;
    }

    getCurrentTask(): string {
        return this.params?.taskCodes[this.taskCounter] || '';
    }

    pushResult(result: Result, increment?: boolean): void {
        // pushes result to local array
        this.results.push(result);
        if(increment) this.taskCounter++;
    }

    // OLD VERSION BETWEEN SUBJECT
    // setupSurvey(): void {
    //     if (this.params === null) return;

    //     console.log(this.params);

    //     const task = this.params.taskCode;
    //     const description = this.params.taskDescription;

    //     // iterate over this.params.eogNetApproaches
    //     this.params.egoNetApproaches.forEach((approach, i) => {
    //         // construct question
    //         const question = {
    //             name: `${approach}-${task}`,
    //             elements: [
    //                 {
    //                     type: 'text',
    //                     placeholder: 'Enter your answer here',
    //                     inputType: 'text',
    //                     isRequired: true,
    //                     title: 'Answer',
    //                     name: `${approach}-${task}-answer`
    //                 },
    //                 {
    //                     type: this.questionMap.get(approach) as string,
    //                     title: this.titleMap.get(approach) as string,
    //                     description: description
    //                 }
    //             ]
    //         };

    //         // put question after intro page
    //         SURVEY_JSON.pages.splice(i + 1, 0, question);
    //     });
        
    //     this.surveySetup = true;
    // }



    setupSurvey(): void {
        if (this.params === null) return;
        
        const approach = this.params.egoNetApproach;

        // depending on approach plug in tutorial page
        const tutorial = {
            name: 'tutorial',
            elements: [
                {
                    type: 'html',
                    html: `
                    <div>
                        <h2>Ego Networks</h2>
                        <p style="padding-bottom:2em;">
                            A network is a representation of connectivity between entities. Each entity is called a <b>node</b>. Connections between nodes are called <b>edges.</b> 
                            In this study, we are particularly interested in studying so-called <b>ego networks</b>. An ego network represents connections relative to a particular focal node, the so-called <b>ego</b>. In other words: instead of visualizing an entire network, we only visualize nodes important to the ego, i.e. its neighbors, its neighbors' neighbors, etc.. 
                            The neighbors of the ego are called <b>1-alters</b>, the neighbors of the neighbors 2-alters, and so on.
                        </p>
                        
                        <h2>${this.titleMap.get(approach)}</h2>
                        <p>${this.tutorialRepresenation.get(approach)}</p>
                    </div>`
                },
                {
                    type: this.questionMap.get(approach) as string,
                    title: this.titleMap.get(approach) as string,
                    description: ''
                }
            ]
        };

        // put tutorial page after intro page
        SURVEY_JSON.pages.splice(2, 0, tutorial);

        // iterate over this.params.eogNetApproaches
        this.params.taskCodes.forEach((task, i) => {
            if(task === 'tutorial') return;
            // construct question
            const question = {
                name: `${approach}-${task}`,

                elements: [
                    {
                        type: 'html',
                        html: `
                        <div style="font-size: 1.5rem;">
                            <h2>Definitions</h2>
                            <p style="padding-bottom: .5em;">
                                <ul style="list-style-type: disc; padding-left: 2rem;">
                                    <li><b>Ego</b>: The focal node, <span style="font-size: 1.5rem; font-weight: bold; color:#000000;">colored black</span>, of the network.</li>
                                    <li><b>1-alters</b>: The neighbors of the ego, <span style="font-size: 1.5rem; font-weight: bold; color:#66c2a5;">colored green</span>.</li>
                                    <li><b>2-alters</b>: The neighbors of the neighbors of the ego, <span style="font-size: 1.5rem; font-weight: bold; color:#fc8d62;">colored orange</span>.</li>
                                    <li><b>3-alters</b>: The neighbors of the neighbors of the neighbors of the ego, <span style="font-size: 1.5rem; font-weight: bold; color:#8da0cb;">colored blue</span>.</li>
                                    <li><b>inter-alter edges</b>: Connections between nodes of different alter levels, <span style="font-size: 1.5rem; font-weight: bold; color:#000000;">colored black</span>.</li>
                                    <li><b>intra-alter edges</b>: Connections between nodes of the same alter level, colored according to alter level.</li>
                                    <li><b>association strength</b>: The <b>weight</b> of the edge between nodes, encoded as stroke width or cell color.</li>
                                </ul>
                            </p>
                        </div>
                        ` 
                    },
                    {
                        type: this.questionMap.get(approach) as string,
                        description: this.titleMap.get(approach) as string,
                        title: this.params?.taskDescriptions[i]
                    },
                    {
                        type: 'text',
                        placeholder: this.taskInputType.get(task) === 'number' ? 'Enter your answer (number)' : 'Enter your answer here (comma separated)',
                        inputType: this.taskInputType.get(task) as string,
                        isRequired: true,
                        title: 'Answer',
                        name: `${approach}-${task}-answer`
                    }
                ]
            };

            const feedback = {
                name: `${approach}-${task}-feedback`,
                elements: [
                    {
                        type: 'html',
                        html: `
                        <h3>The task was:</h3>
                        <p style="font-size: 1.5rem;">${this.params?.taskDescriptions[i]}</p>
                        `
                    },
                    {
                        type: 'comment', 
                        title: 'Comments',
                        name: `${approach}-${task}-feedback`,
                        isRequired: true,
                        placeHolder: 'What did you think about this task? What did you find easy or difficult? Any suggestions for improvement?'
                    }
                ]
            };

            // put question after intro page
            SURVEY_JSON.pages.splice(i * 2 + 1, 0, question);
            SURVEY_JSON.pages.splice(i * 2 + 2, 0, feedback);
        });
        console.log(SURVEY_JSON);
        this.surveySetup = true;
    }

    isSetup(): boolean {
        return this.surveySetup;
    }

    getEgoNetApproach(): string {
        return this.params?.egoNetApproach || 'matrix';
    }

    getSurvey(): any {
        return SURVEY_JSON;
    }

    submitResults(): Observable<any> {
        console.log(this.results);
        // submits results to backend
        return this.http.post(`${CONFIG.API_BASE}results`, { params: this.params, results: this.results });
    }
}