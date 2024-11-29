import { ButtonComponent } from './components/atoms/button/button.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GamePageComponent } from './components/pages/game.page/game.page.component';
import { CardComponent } from './components/atoms/card/card.component';
import { TableGameComponent } from './components/molecules/table-game/table.component';
import { RegisterUserComponent } from './components/pages/register.page/register.user.component';
import { InputAtomComponent } from './components/atoms/input/input.component';
import { CreateGameFormComponent } from './components/molecules/create-game-form/create-game-molecule.component';
import { CreateGamePage } from './components/pages/create-game/create-game.component';
import { CartComponent } from './components/atoms/cart/cart.component';
import { ToastComponent } from './components/atoms/toast/toast.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    TableGameComponent,
    GamePageComponent,
    RegisterUserComponent,
    ButtonComponent,
    InputAtomComponent,
    CreateGameFormComponent,
    CreateGamePage,
    CartComponent,
    ToastComponent,
    ButtonComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
