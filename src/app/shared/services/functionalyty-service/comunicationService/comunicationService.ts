import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/shared/interfaces/user.model';

@Injectable({
  providedIn: 'root'
})
export class GameCommunicationService {
  private readonly GAME_PLAYERS_KEY = 'game_table_players';
  private playerSubject = new BehaviorSubject<User | null>(null);
  player$ = this.playerSubject.asObservable();

  constructor() {
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
}
