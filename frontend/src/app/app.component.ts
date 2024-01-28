import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResultsService } from 'src/services/results.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Ego Network Study';

  protected hasErrored: boolean = false;
  protected showError: { show: boolean, message: string, email: string } = { show: false, message: '', email: 'velitchko.filipov@tuwien.ac.at?subject=EgoNetStudyError&body=ERROR' };

  constructor(private http: HttpClient, protected resultsService: ResultsService) {}

  next(result: any) {
    if (result) {
      this.resultsService.setUserParams(result.user);
      this.resultsService.setupSurvey();
      console.log('👌Got survey params from backend');
      console.log(result);
    } else {
      console.error('🚒 Error: no params received from backend');
    }
  }

  error(err: Error) {
    this.hasErrored = true;
    this.showError.message = err.message;

    console.error('🚒 Error: no params received from backend');
    console.error(err);
  }

  dismiss() {
    this.showError.show = false;
    this.hasErrored = false;
    console.log('👌 Dismissed error message');
  }

  viewMore() {
    this.showError.show = true;
  }

  ngOnInit() {
    // request params from backend
    this.http.get('http://localhost:8080/params')
      .subscribe({
        next: this.next.bind(this),
        error: this.error.bind(this),
      });

  }
}
