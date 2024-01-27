import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResultsService } from 'src/services/results.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ego-net-survey';

  constructor(private http: HttpClient, private resultsService: ResultsService) {}

  ngOnInit() {
    // request params from backend
    this.http.get('http://localhost:8080/params').subscribe((res: any) => {
      if (res) {
        this.resultsService.setUser(res.user);
      } else {
        console.error('Error: no params received from backend');
      }
    });

  }
}
