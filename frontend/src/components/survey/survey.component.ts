
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
        // survey.applyTheme(LayeredDarkPanelless);        

        this.survey = survey;
        
        this.survey.onStarted.add((sender, options) => {
            this.resultsService.pushResult({
                index: -99,
                time: 0,
                task: 'intro',
                representation: '',
                answer: {
                    confirm: sender.data['question_intro_confirm'],
                    agreement: sender.data['question_intro_agree']
                }
            });
            console.log('⏰ Survey started');
        });
    
        this.survey.onCurrentPageChanged.add((sender, options) => {
            if(options.oldCurrentPage.name === 'demographics') {
                console.log('📊 Demographics page');

                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: 'demographics',
                    representation: '',
                    answer: {
                        prolificId: sender.data['prolific_id'],
                        gender: sender.data['gender'],
                        ageGroup: sender.data['age'],
                        education: sender.data['education'],
                        familiarity: sender.data['network_knowledge'],
                    }
                });
                
                return;
            }

            if(options.oldCurrentPage.name === 'tutorial') {
                console.log('📊 Tutorial page');

                this.timer.start = Date.now();
                return;
            }
            
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;

            // push to results
            this.resultsService.pushResult({
                index: options.oldCurrentPage.visibleIndex,
                time: time,
                task: options.oldCurrentPage.name.split('-')[options.oldCurrentPage.name.split('-').length - 1],
                // GET SUBSTRING FROM START TO options.newCurrentPage.name.split('-')[options.newCurrentPage.name.split('-').length - 1]
                representation: options.oldCurrentPage.name.split('-')[0],
                answer: sender.data[`${options.oldCurrentPage.name}-answer`]
            }, true);

            // reset start time
            this.timer.start = Date.now();
        });

        this.survey.onComplete.add((sender) => {
            const qualitativeFeedback = {
                learn: sender.data['ego-rep-learn'],
                use: sender.data['ego-rep-use'],
                aesth: sender.data['ego-rep-aesth'],
                acc: sender.data['ego-rep-acc'],
                quick: sender.data['ego-rep-quick'],
                like: sender.data['ego-rep-like'],
                dislike: sender.data['ego-rep-dislike']
            };

            // push to results
            this.resultsService.pushResult({
                index: -99,
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
                    window.open('https://google.com', '_blank'); // TODO: Update with prolific link
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};