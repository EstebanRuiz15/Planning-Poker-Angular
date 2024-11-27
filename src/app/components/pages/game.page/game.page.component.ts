
import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'src/app/shared/interfaces/game.model';
import { RolUsuario, User } from 'src/app/shared/interfaces/user.model';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { TableGameComponent } from '../../molecules/table-game/table.component';
@Component({
  selector: 'app-game-page',
  templateUrl: './game.page.component.html',
  styleUrls: ['./game.page.component.scss']
})
export class GamePageComponent implements OnInit {
  gameName: string | null = null;
  userName: string | null = null;
  gameId: string | null = null;
  gameState: 'waiting' | 'voted' | 'completed' = 'waiting';
  gameVotes: { [userId: string]: number } = {};
  isAdmin = false;
  isAdminChecked = false;
  currentUserVote: number | null = null;
  player$ = this.gameCommunicationService.player$;
  users: User[] = [];

  fibonacciNumbers: number[] = this.generateFibonacciUpTo89();

  constructor(private route: ActivatedRoute, private gameService: GameService, private gameCommunicationService: GameCommunicationService) {
    this.player$.subscribe(player => {
      if (player) {
        this.users = this.gameCommunicationService.getStoredPlayers(player.gameId);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.gameId = params.get('gameId');
      if (this.gameId) {
        this.gameService.getGameById(this.gameId).subscribe({
          next: (game) => {
            this.gameName = game.name;
            this.gameState = game.state;
            this.gameVotes = game.votes;
            this.checkAdminStatus();
          },
          error: (err) => {
            this.gameName = null;
          }
        });
      }
    });
    this.userName = this.gameService.AuthService();
  }

  checkAdminStatus(): void {
    this.userName=this.gameService.AuthService();
    console.log('game current ', this.gameId, this.userName)
    if (this.gameId && this.userName) {
      this.isAdmin = this.gameService.isAdminUser(this.gameId, this.userName);
      this.isAdminChecked = true;
    }
  }

  getInitials(name: string): string {
    const firstWord = name.split(' ')[0];
    const initials = firstWord.substring(0, 2);
    return initials.toUpperCase();
  }

  vote(vote: number): void {
    console.log(`User ${this.userName} is voting with value ${vote}`);
    if (this.gameId && this.userName) {
      // Obtener al jugador actual
      const currentUser = this.gameService.getCurrentUser(this.gameId, this.userName);

      // Verificar si el usuario tiene el rol 'player'
      if (currentUser && currentUser.rol === RolUsuario.PLAYER) {
        console.log(`Current user found: ${currentUser.id}`);

        // Registrar el voto si es un jugador
        this.gameService.playerVote(this.gameId, currentUser.id, vote).subscribe({
          next: (game) => {
            this.currentUserVote = vote;
            this.gameVotes = game.votes;
            this.gameState = game.state;
            console.log(`Vote recorded for user ${currentUser.id}: ${vote}`);
            console.log(`Updated game votes:`, this.gameVotes);
            this.onCardSelected(currentUser.id, this.gameId!, vote);
          },
          error: (err) => {
            console.error(`Error recording vote for user ${currentUser.id}:`, err);
          }
        });
      } else {
        // Si el usuario no tiene rol de 'player', no permitir la selección
        console.log('User does not have player role and cannot vote');
      }
    }
  }

  isPlayerRole(): boolean {
    if (this.gameId  && this.userName){
    const currentUser = this.gameService.getCurrentUser(this.gameId, this.userName);
    return currentUser ? currentUser.rol === RolUsuario.PLAYER : false;
    }
    return false;
  }

  onCardSelected(playerId: string, gameId: string, vote: number): void {
    console.log(`onCardSelected called with playerId: ${playerId}, gameId: ${gameId}, vote: ${vote}`);
    this.gameCommunicationService.updateUserVote(playerId, gameId, vote);
    this.users = this.gameCommunicationService.getStoredPlayers(gameId);
    console.log(`Updated users after card selection:`, this.users);
  }

  canRevealVotes(): boolean {
    if (!this.gameId) return false;

    const playerCount = this.gameService.getGamePlayerCount(this.gameId, RolUsuario.PLAYER);
    const votedCount = Object.keys(this.gameVotes).length;

    return playerCount === votedCount && this.gameState === 'voted';
  }

  revealVotes(): void {
    if (this.gameId) {
      this.gameService.revealVotes(this.gameId).subscribe({
        next: (game) => {
          this.gameState = game.state;
        }
      });
    }
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

  allPlayersVoted(): boolean {
    if (!this.gameId) return false;
    let playerCountInGame = 0;

    this.gameService.getGameById(this.gameId).subscribe({
      next: (game) => {
        playerCountInGame = game.players.filter(p => p.rol === RolUsuario.PLAYER).length;
      },
      error: (err) => {
        console.error('Error al obtener el juego:', err);
      }
    });
    const playerCount = Object.keys(this.gameVotes).length;

    return playerCountInGame === playerCount;
  }

  getVotesForNumber(vote: number): number {
    return Object.values(this.gameVotes).filter(v => v === vote).length;
  }

  getCurrentUserVote(): { vote: number | null, id: string | null } {
    if (!this.userName) return { vote: null, id: null };

    const currentUser = this.gameService.getCurrentUser(this.gameId!, this.userName);
    if (currentUser) {
      const vote = this.gameVotes[currentUser.id];
      return { vote: vote !== undefined ? vote : null, id: currentUser.id };
    }

    return { vote: null, id: null };
  }

  generateFibonacciUpTo89(): number[] {
    let fib = [0, 1, 3, 5];
    while (true) {
      const nextFib = fib[fib.length - 1] + fib[fib.length - 2];
      if (nextFib > 89) break;
      fib.push(nextFib);
    }
    return fib;
  }

  get objectKeys() {
    return Object.keys;
  }
}
