import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalErrorHandler, ErrorEvent } from '../../services/error.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit, OnDestroy {
    private error$: Observable<ErrorEvent>;
    subscription: Subscription;

    protected hasErrored: boolean = false;
    protected showError: { show: boolean, message: string, email: string } = { show: false, message: '', email: 'velitchko.filipov@tuwien.ac.at?subject=EgoNetStudyError&body=ERROR' };

    constructor(private errorHandler: GlobalErrorHandler) {
        this.error$ = this.errorHandler.getObservable() ?? new Observable<ErrorEvent>();
        this.subscription = new Subscription();
    }

    ngOnInit() {
        this.subscription = this.error$.subscribe((err: ErrorEvent) => {
            if(!err.error) return;
            this.error(err);
        });
    }

    ngOnDestroy() {
        console.log('👋 Destroyed error component');
        this.subscription.unsubscribe();
    }

    error(err: ErrorEvent) {
        console.log(err.error);
        console.log(err.message);
        this.hasErrored = true;
        this.showError.message = err.message;
    }

    dismiss() {
        this.showError.show = false;
        this.hasErrored = false;
        console.log('👌 Dismissed error message');
    }

    viewMore() {
        this.showError.show = true;
    }

}
