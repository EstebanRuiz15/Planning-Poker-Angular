import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGamePage } from './components/pages/create-game/create-game.component';
import { GamePageComponent } from './components/pages/game.page/game.page.component';
import { RegisterUserComponent } from './components/pages/register.page/register.user.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'create-game',
    pathMatch: 'full'
  },
  {
    path: 'create-game',
    component: CreateGamePage
  },
  {
    path: 'game/:gameId',
    component: GamePageComponent
  },
  {
    path: 'register/:name/:id',
    component: RegisterUserComponent
  },
  {
    path: '**',
    redirectTo: 'create-game'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
