
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Survey from 'survey-angular';
import { Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { surveyJson } from '../../assets/survey.js';
import { HttpClient } from '@angular/common/http';
import { ResultsService } from '../../services/results.service';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
    protected surveyModel: Model;

    private timer: {
        start: number,
        end: number
    };

    constructor(private http: HttpClient, private resultsService: ResultsService) {
        this.surveyModel = new Model();
        this.timer = {
            start: 0,
            end: 0
        };
    }

    ngOnInit(): void {
        const survey = new Model(surveyJson);
        survey.showProgressBar = 'bottom';
        survey.showQuestionNumbers = 'off';
        survey.applyTheme(LayeredDarkPanelless);        

        this.surveyModel = survey;

        this.surveyModel.onStarted.add((sender) => {
            this.timer.start = Date.now();
            console.log('Survey started');
        });

        this.surveyModel.onCurrentPageChanged.add((sender, options) => {
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;

            console.log('time taken: ' + time
                + '\nold page: ' + options.oldCurrentPage.name,
                + '\nnew page: ' + options.newCurrentPage.name,
                + '\nrepresentation: ' + options.oldCurrentPage.name.split('-')[0],
                + '\ntask: ' + options.oldCurrentPage.name.split('-')[options.oldCurrentPage.name.split('-').length - 1],
                + '\nanswer: ' + sender.data[`${options.oldCurrentPage.name}-answer`])

            // push to results
            this.resultsService.pushResult({
                time: time,
                task: options.oldCurrentPage.name.split('-')[options.oldCurrentPage.name.split('-').length - 1],
                // GET SUBSTRING FROM START TO options.newCurrentPage.name.split('-')[options.newCurrentPage.name.split('-').length - 1]
                representation: options.oldCurrentPage.name.split('-')[0],
                answer: sender.data[`${options.oldCurrentPage.name}-answer`]
            });

            // reset start time
            this.timer.start = Date.now();
        });

        this.surveyModel.onComplete.add((sender, options) => {
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;
            console.log(`Survey completed in ${time}ms`);

            console.log(sender.data);

            const qualitativeFeedback = {
                m: sender.data['m'],
                nl: sender.data['nl'],
                l: sender.data['l'],
                r: sender.data['r'],
                comments: sender.data['comments']
            };

            // push to results
            this.resultsService.pushResult({
                time: 0,
                task: 'qualitative-feedback',
                representation: 'qualitative-feedback',
                answer: qualitativeFeedback
            });

            // post to backend
            this.resultsService.submitResults().subscribe((res: any) => {
                if (res) {
                    console.log(res);
                } else {
                    console.error('Error: no response received from backend');
                }
            });
        });
    }
};