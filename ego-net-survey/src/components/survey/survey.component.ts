
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Survey from 'survey-angular';
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
    protected surveyModel: Survey.Model;

    private timer: {
        start: number,
        end: number
    };

    constructor(private http: HttpClient, private resultsService: ResultsService) {
        this.surveyModel = new Survey.Model();
        this.timer = {
            start: 0,
            end: 0
        };
    }

    ngOnInit(): void {
        const survey = new Survey.Model(surveyJson);
        survey.showProgressBar = 'bottom';
        survey.applyTheme(LayeredDarkPanelless);

        this.surveyModel = survey;


        Survey
            .SurveyNG
            .render("survey", { model: this.surveyModel, isExpanded: true });

        this.surveyModel.onStarted.add((sender) => {
            this.timer.start = Date.now();
            console.log('Survey started');
        });

        this.surveyModel.onCurrentPageChanged.add((sender, options) => {
            console.log(`Page changed to ${options.newCurrentPage.name}`);
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;
            console.log(`Page completed in ${time}ms`);
            console.log(sender.data);
            // push to results
            this.resultsService.pushResult({
                time: time,
                representation: options.newCurrentPage.name,
                answer: sender.data
            });

            // reset start time
            this.timer.start = Date.now();
        });

        this.surveyModel.onComplete.add((result) => {
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;

            console.log(`Survey completed in ${time}ms`);
            console.log(result.data);

            // push to results
            this.resultsService.pushResult({
                time: time,
                representation: 'complete',
                answer: result.data
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