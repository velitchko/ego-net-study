import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { SurveyModule } from "survey-angular-ui";
import { MModule } from '../modules/m.module';
import { LModule } from '../modules/l.module';
import { RModule } from '../modules/r.module';
import { NlModule } from '../modules/nl.module';

import { AppComponent } from './app.component';
import { SurveyComponent  } from '../components/survey/survey.component';
import { CustomMatrixQuestionComponent } from '../components/m/m.question';
import { CustomNodeLinkQuestionComponent } from 'src/components/nl/nl.question';
import { CustomRadialQuestionComponent } from 'src/components/r/r.question';
import { CustomLayeredQuestionComponent } from 'src/components/l/l.question';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    CustomMatrixQuestionComponent,
    CustomNodeLinkQuestionComponent,
    CustomRadialQuestionComponent,
    CustomLayeredQuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SurveyModule,
    MModule,
    LModule,
    RModule,
    NlModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
