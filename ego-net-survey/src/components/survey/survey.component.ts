
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AfterRenderSurveyEvent, Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { HttpClient } from '@angular/common/http';
import { ResultsService } from '../../services/results.service';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
    protected survey: Model;

    private timer: {
        start: number,
        end: number
    };

    constructor(private http: HttpClient, protected resultsService: ResultsService) {
        this.survey = new Model();
        

        this.timer = {
            start: 0,
            end: 0
        };

        this.survey.onAfterRenderSurvey.add(this.init.bind(this));       
    }  
    
    ngAfterViewInit() {
        this.survey.onAfterRenderSurvey.add(this.init.bind(this));
    }
    
    
    init(): void {
        // check if survey is setup already if not try again in 1 second
        if (!this.resultsService.isSetup()) {
            setTimeout(() => this.init(), 1000);
            return;
        }

        const survey = new Model(this.resultsService.getSurvey());
        survey.applyTheme(LayeredDarkPanelless);        

        this.survey = survey;

        this.survey.onStarted.add((sender) => {
            this.timer.start = Date.now();
            console.log('⏰ Survey started');
        });

        this.survey.onCurrentPageChanged.add((sender, options) => {
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;

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

        this.survey.onComplete.add((sender) => {

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
            this.resultsService.submitResults().subscribe((res: Response) => {
                if (res) {
                    console.log(res);
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};