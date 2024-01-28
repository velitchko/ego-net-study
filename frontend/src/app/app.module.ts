// modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { SurveyModule } from "survey-angular-ui";
import { MModule } from '../modules/m.module';
import { LModule } from '../modules/l.module';
import { RModule } from '../modules/r.module';
import { NlModule } from '../modules/nl.module';

// handlers
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from '../services/error.service';

// components
import { AppComponent } from './app.component';
import { SurveyComponent  } from '../components/survey/survey.component';
import { CustomMatrixQuestionComponent } from '../components/m/m.question';
import { CustomNodeLinkQuestionComponent } from '../components/nl/nl.question';
import { CustomRadialQuestionComponent } from '../components/r/r.question';
import { CustomLayeredQuestionComponent } from '../components/l/l.question';
import { ErrorComponent } from '../components/error/error.component';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    CustomMatrixQuestionComponent,
    CustomNodeLinkQuestionComponent,
    CustomRadialQuestionComponent,
    CustomLayeredQuestionComponent,
    ErrorComponent
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
  providers: [{
    provide: ErrorHandler,
    useClass: GlobalErrorHandler
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
