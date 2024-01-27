// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private user: string = ''; //uuidv4
    private results: Array<{ time: number, representation: string, answer: string | number }> = [];

    constructor(private http: HttpClient) { }

    setUser(user: string): void {
        // sets local uui obtained from backend 
        this.user = user;
    }

    getUser(): string {
        return this.user;
    }

    pushResult(result: { time: number, representation: string, answer: string | number }): void {
        // pushes result to local array
        this.results.push(result);
    }

    submitResults(): Observable<any> {
        // submits results to backend
        return this.http.post('http://localhost:8080/results', { user: this.user, results: this.results });
    }
}