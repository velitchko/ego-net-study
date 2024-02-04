// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SURVEY_JSON } from '../assets/survey.js';
import { CONFIG } from '../assets/config';

type QualitativeAnswer = {
    m: number,
    nl: number,
    l: number,
    r: number,
    comments: string
};

export type Params = {
    user: string,
    egoNetApproaches: Array<string>,
    taskCode: string,
    taskDescription: string
};

export type Result = { 
    index: number,
    time: number, 
    task: string, 
    representation: string, 
    answer: string | number | QualitativeAnswer 
} | {
    index: number,
    time: number,
    order: Array<string>,
    task: string,
};
@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private params: Params | null;

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
            order: this.params.egoNetApproaches,
            task: this.params.taskCode
        });
    }

    getUserParams(): Params | null {
        return this.params;
    }

    pushResult(result: Result): void {
        // pushes result to local array
        this.results.push(result);
    }

    setupSurvey(): void {
        if (this.params === null) return;

        const task = this.params.taskCode;
        const description = this.params.taskDescription;

        // iterate over this.params.eogNetApproaches
        this.params.egoNetApproaches.forEach((approach, i) => {
            // construct question
            const question = {
                name: `${approach}-${task}`,
                elements: [{
                    type: this.questionMap.get(approach) as string,
                    title: this.titleMap.get(approach) as string,
                    description: description
                }, {
                    type: 'text',
                    placeholder: 'Enter your answer here',
                    inputType: 'text',
                    isRequired: true,
                    title: 'Answer',
                    name: `${approach}-${task}-answer`
                }]
            };

            // put question after intro page
            SURVEY_JSON.pages.splice(i + 1, 0, question);
        });
        
        this.surveySetup = true;
    }

    isSetup(): boolean {
        return this.surveySetup;
    }

    getSurvey(): any {
        return SURVEY_JSON;
    }

    submitResults(): Observable<any> {
        // submits results to backend
        return this.http.post(`${CONFIG.API_BASE}results`, { params: this.params, results: this.results });
    }
}