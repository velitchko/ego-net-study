// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { surveyJson } from '../assets/survey.js';

type QualitativeAnswer = {
    m: number,
    nl: number,
    l: number,
    r: number,
    comments: string
};
@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private params: {
        user: string,
        egoNetApproaches: Array<string>,
        taskCode: string,
        taskDescription: string
    } | null;

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

    private results: Array<{ time: number, task: string, representation: string, answer: string | number | QualitativeAnswer }> = [];

    constructor(private http: HttpClient) {
        this.params = null;
        this.results = [];
    }

    setUserParams(params: { user: string, egoNetApproaches: Array<string>, taskCode: string, taskDescription: string }): void {
        this.params = params;
    }

    getUserParams(): { user: string, egoNetApproaches: Array<string>, taskCode: string, taskDescription: string } | null {
        return this.params;
    }

    pushResult(result: { time: number, task: string, representation: string, answer: string | number | QualitativeAnswer }): void {
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
            surveyJson.pages.splice(i + 1, 0, question);
        });
        
        this.surveySetup = true;
    }

    isSetup(): boolean {
        return this.surveySetup;
    }

    getSurvey(): any {
        return surveyJson;
    }

    submitResults(): Observable<any> {
        // submits results to backend
        return this.http.post('http://localhost:8080/results', { params: this.params, results: this.results });
    }
}