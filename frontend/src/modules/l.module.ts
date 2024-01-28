import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LComponent } from '../components/l/l.component';

@NgModule({
    declarations: [
        LComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LComponent
    ]
})
export class LModule { }