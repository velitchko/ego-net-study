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
    like: string,
    dislike: string
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
        ['matrix', `Adjacency matrix representations of ego networks display the connectivity between entities tabularly. Each entity, i.e. node, is represented twice, once as a labeled row, and once as a labeled column. If a connection, i.e. an edge, exists between two nodes the corresponding matrix cell is “filled”. This means that each edge is represented twice as well. For example, if an edge connects nodes 3 and 5, then the matrix cells at locations (3,5) and (5,3) are filled in. Don't count these twice though - this is still just one edge. Note that, because nodes cannot be connected to themselves, the diagonal of the matrix is empty. Lastly, the darker a cell is colored, the stronger the edge connecting two nodes is. 
        <br/>
        The ego of a particular ego network will always be represented at the top left of the matrix table (in the example below node #34). Alters are arranged in colored blocks depending on their proximity to the ego. That is to say that, after the ego, the first colored block consists of 1-alters, the second of 2-alters, and so forth. Alter intra-alter edges and nodes are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. Inter-alter edges are colored in black.
        <br/>
        During the actual evaluation, the graph will be interactive. You will be able to zoom in and out, pan, and highlight the neighbors of individual nodes.`],
        ['nodelink', `The node-link diagram is the most common form of network representation. In it, each entity, i.e. node, is represented as a circle, whose label is positioned at the circle's center. A relationship, i.e. an edge, connecting two particular nodes is drawn as a straight line between them. The darker the line, the stronger the edge connecting two nodes is.        
        <br/>
        The ego, in the example below node #34, of a particular network is colored black. Alters, as well as intra-alter edges, are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. Inter-alter edges are colored in black.
        <br/>
        During the actual evaluation, the graph will be interactive. You will be able to zoom in and out, pan, and highlight the neighbors of individual nodes.`],
        ['layered', `In a layered node-link diagram, each entity, i.e. node, is represented as a circle with its label positioned at the circle's center. A relationship, i.e. an edge, connecting two particular nodes is drawn as a straight line between them. The darker the line, the stronger the edge connecting two nodes is. 
        <br/>
        The network's ego, in the example below node #34, is positioned at the top of the diagram, colored in black. Alters, as well as intra-alter edges, are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. Additionally, alters are placed along layered lines beneath the ego, i.e. 1-alters are placed along the first line, 2-alters along the second, and so on. Inter-alter edges are colored in grey and connect nodes between such layers.
        <br/>
        During the actual evaluation, the graph will be interactive. You will be able to zoom in and out, pan, and highlight the neighbors of individual nodes.`],
        ['radial', `In a radial node-link diagram, each entity, i.e. node, is represented as a circle with its label positioned at the circle's center. A relationship, i.e. an edge, connecting two particular nodes is drawn as a straight line between them. The darker the line, the stronger the edge connecting two nodes is.
        <br/>
        The network's ego, in the example below node #34, is positioned at the center of the diagram, colored in black. Alters, as well as intra-alter edges, are color-coded: 1-alters in green, 2-alters in orange, 3-alters in blue, and 4-alters in pink. Additionally, alters are placed along concentric circles around the ego, i.e. 1-alters are placed along the first ring, 2-alters along the second, and so on. Inter-alter edges are colored in grey and connect nodes between such concentric circles.
        <br/>
        During the actual evaluation, the graph will be interactive. You will be able to zoom in and out, pan, and highlight the neighbors of individual nodes.`]
    ]);

    private surveySetup: boolean = false;

    private results: Array<Result> = new Array<Result>();

    constructor(private http: HttpClient) {
        this.params = null;
    }

    setUserParams(params: Params): void {
        this.params = params;

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
        console.log(this.taskCounter);
        console.log(this.params?.taskCodes);
        console.log(this.params?.taskCodes[this.taskCounter]);
        return this.params?.taskCodes[this.taskCounter] || '';
    }

    pushResult(result: Result, increment?: boolean): void {
        // pushes result to local array
        this.results.push(result);
        console.log(this.results);
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

        // TODO: Add tutorial page explaining ego network + explanation depending on egoNetApproach

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
                        <img src="../assets/${approach}.png" alt="${approach}" style="width: 100%; height: auto;">
                    </div>`
                }
            ]
        };

        // put tutorial page after intro page
        SURVEY_JSON.pages.splice(2, 0, tutorial);

        // iterate over this.params.eogNetApproaches
        this.params.taskCodes.forEach((task, i) => {
            // construct question
            const question = {
                name: `${approach}-${task}`,

                elements: [
                    {
                        type: 'text',
                        placeholder: this.taskInputType.get(task) === 'number' ? 'Enter your answer (number)' : 'Enter your answer here (comma separated)',
                        inputType: this.taskInputType.get(task) as string,
                        isRequired: true,
                        title: 'Answer',
                        name: `${approach}-${task}-answer`
                    },
                    {
                        type: this.questionMap.get(approach) as string,
                        title: this.titleMap.get(approach) as string,
                        description: this.params?.taskDescriptions[i]
                    }
                ]
            };

            // put question after intro page
            SURVEY_JSON.pages.splice(i + 3, 0, question);
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
        // submits results to backend
        return this.http.post(`${CONFIG.API_BASE}results`, { params: this.params, results: this.results });
    }
}