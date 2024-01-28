import { ErrorHandler, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export type ErrorEvent = {
    error: Error | null,
    message: string
};

@Injectable({
    providedIn: 'root'
})
export class GlobalErrorHandler extends ErrorHandler {
    // create observable for error events
    private error$: BehaviorSubject<ErrorEvent> = new BehaviorSubject<ErrorEvent>({ error: null, message: '' });

    override handleError(error: unknown, message?: string) {
        const errorObject = error instanceof Error ? error : new Error('Unknown error');
        const errorMessage = message ? message : 'An unknown error occurred';
        const errorEvent = { error: errorObject, message: errorMessage };
        
        
        if(error) this.error$.next(errorEvent);
}

    getObservable(): Observable<ErrorEvent> {
        return this.error$.asObservable();
    }
}