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

        const approach = this.params.egoNetApproach;
        // iterate over this.params.eogNetApproaches
        this.params.taskCodes.forEach((task, i) => {
            // TODO: Plug in node ids per task where $
            // construct question
            const question = {
                name: `${approach}-${task}`,
                elements: [
                    {
                        type: 'text',
                        placeholder: 'Enter your answer here',
                        inputType: 'text',
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
            console.log(question);

            // put question after intro page
            SURVEY_JSON.pages.splice(i + 2, 0, question);
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