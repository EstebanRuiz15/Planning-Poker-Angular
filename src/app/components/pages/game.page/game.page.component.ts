import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-page',
  templateUrl: './game.page.component.html',
  styleUrls: ['./game.page.component.scss']
})
export class GamePageComponent implements OnInit {
  gameName: string | null = null;
  userName: string | null = null;
  gameId: string | null = null;

  fibonacciNumbers: number[] = this.generateFibonacciUpTo89();
  constructor(private route: ActivatedRoute, private gameService: GameService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.gameId = params.get('gameId');
      if (this.gameId) {
        this.gameService.getGameById(this.gameId).subscribe({
          next: (game) => {
            this.gameName = game.name;
          },
          error: (err) => {
            this.gameName = null;
          }
        });
      }
    });
    this.userName = this.gameService.AuthService();
  }

  getInitials(name: string): string {
    const firstWord = name.split(' ')[0];
    const initials = firstWord.substring(0, 2);
    return initials.toUpperCase();
  }

  copyInvitationLink(): void {
    if (this.gameId && this.gameName) {
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/register/${this.gameName}/${this.gameId}`;
      navigator.clipboard.writeText(invitationLink).then(() => {
      }).catch(err => {
      });
    }
  }

  generateFibonacciUpTo89(): number[] {
    let fib = [0, 1, 3,5];
    while (true) {
        const nextFib = fib[fib.length - 1] + fib[fib.length - 2];
        if (nextFib > 89) break;
        fib.push(nextFib);
    }
    return fib;
  }
}
