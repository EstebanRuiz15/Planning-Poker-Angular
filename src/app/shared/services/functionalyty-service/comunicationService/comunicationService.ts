import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/shared/interfaces/user.model';
import { GameService } from '../GameService/game.service.impl';

@Injectable({
  providedIn: 'root'
})
export class GameCommunicationService {
  private readonly GAME_PLAYERS_KEY = 'game_table_players';
  private playerSubject = new BehaviorSubject<User | null>(null);
  player$ = this.playerSubject.asObservable();
  private votesSubject = new BehaviorSubject<{ [userId: string]: number }>({});
  votes$ = this.votesSubject.asObservable();


  constructor(private gameService: GameService) {
    const storedPlayer = localStorage.getItem('currentPlayer');
    if (storedPlayer) {
      this.playerSubject.next(JSON.parse(storedPlayer));
    }
  }

  addPlayerToGame(player: User) {
    localStorage.setItem('currentPlayer', JSON.stringify(player));

    const players = this.getStoredPlayers(player.gameId);
    const playerExists = players.some(p => p.id === player.id);

    if (!playerExists) {

      players.push(player);
      this.savePlayers(player.gameId, players);

      this.playerSubject.next(player);
    }
  }

  getStoredPlayers(gameId: string): User[] {
    const playersJson = localStorage.getItem(`${this.GAME_PLAYERS_KEY}_${gameId}`);
    return playersJson ? JSON.parse(playersJson) : [];
  }

  private savePlayers(gameId: string, players: User[]): void {
    localStorage.setItem(`${this.GAME_PLAYERS_KEY}_${gameId}`, JSON.stringify(players));
  }

  clearState(gameId: string): void {
    localStorage.removeItem(`${this.GAME_PLAYERS_KEY}_${gameId}`);
    localStorage.removeItem('currentPlayer');
    this.playerSubject.next(null);
  }

  updateUserVote(playerId: string, gameId: string, vote: number): void {
    const players = this.getStoredPlayers(gameId);
    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      players[playerIndex].voted = vote;
      this.savePlayers(gameId, players);
      if (this.playerSubject.value && this.playerSubject.value.id === playerId) {
        const updatedPlayer = { ...this.playerSubject.value, voted: vote };
        localStorage.setItem('currentPlayer', JSON.stringify(updatedPlayer));
        this.playerSubject.next(updatedPlayer);
      }
    }
  }

  updateVote(gameId: string, userId: string, vote: number) {
    this.gameService.playerVote(gameId, userId, vote).subscribe(
      (game) => {
        // Emitir los votos actualizados
        this.votesSubject.next(game.votes);
      },
      (error) => {
        console.error('Error updating vote', error);
      }
    );
  }

  loadInitialVotes(gameId: string) {
    this.gameService.getGameById(gameId).subscribe(
      (game) => {
        this.votesSubject.next(game.votes);
      }
    );
  }

}
