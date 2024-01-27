import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NlComponent } from '../components/nl/nl.component';

@NgModule({
    declarations: [
        NlComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NlComponent
    ]
})
export class NlModule { }