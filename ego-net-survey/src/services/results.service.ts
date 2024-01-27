// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    private user: string = ''; //uuidv4
    private results: Array<{ time: number, task: string, representation: string, answer: string | number | QualitativeAnswer }> = [];

    constructor(private http: HttpClient) { }

    setUser(user: string): void {
        // sets local uui obtained from backend 
        this.user = user;
    }

    getUser(): string {
        return this.user;
    }

    pushResult(result: { time: number, task: string, representation: string, answer: string | number | QualitativeAnswer }): void {
        // pushes result to local array
        this.results.push(result);
    }

    submitResults(): Observable<any> {
        // submits results to backend
        return this.http.post('http://localhost:8080/results', { user: this.user, results: this.results });
    }
}