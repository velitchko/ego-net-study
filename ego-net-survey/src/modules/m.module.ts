import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MComponent } from '../components/m/m.component';

@NgModule({
    declarations: [
        MComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        MComponent
    ]
})
export class MModule { }