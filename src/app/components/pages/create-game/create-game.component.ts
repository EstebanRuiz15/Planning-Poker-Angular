import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss']
})
export class CreateGamePage {
  isLoaded = false;
  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoaded = true;
    }, 600);
  }

  onCreateGame(request: any): void {
    this.gameService.createGame(request).subscribe({
      next: (game) => {
        this.router.navigate(['/register', game.name, game.id]);
      },
      error: (error) => {
      }
    });
  }

}
