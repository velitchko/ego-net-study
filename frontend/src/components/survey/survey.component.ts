
import { Component } from '@angular/core';
import { Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { ResultsService } from '../../services/results.service';
import { GlobalErrorHandler } from '../../services/error.service';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
    protected survey: Model;
    protected completed: boolean = false;

    private timer: {
        start: number,
        end: number
    };

    constructor(protected resultsService: ResultsService, private errorService: GlobalErrorHandler) {
        this.survey = new Model();
        
        this.timer = {
            start: 0,
            end: 0
        };   
    }  
    
    ngAfterViewInit() {
        try {
            this.survey.onAfterRenderSurvey.add(this.init.bind(this));
        } catch (error) {
            this.errorService.handleError(error);
        }
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
                    this.completed = true;
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};