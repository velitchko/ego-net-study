import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LComponent } from '../components/l/l.component';
import { MComponent } from '../components/m/m.component';
import { NlComponent } from '../components/nl/nl.component';
import { RComponent } from '../components/r/r.component';
import { SurveyComponent } from '../components/survey/survey.component';

const routes: Routes = [
  { path: 'matrix', component: MComponent },
  { path: 'node-link', component: NlComponent },
  { path: 'radial', component: RComponent },
  { path: 'layered', component: LComponent },
  { path: 'survey', component: SurveyComponent },
  { path: '**', redirectTo: 'survey' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
