import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RComponent } from '../components/r/r.component';

@NgModule({
    declarations: [
        RComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        RComponent
    ]
})
export class RModule { }