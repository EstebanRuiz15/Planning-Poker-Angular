import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { CreateGameRequest, Game } from "src/app/shared/interfaces/game.model";
import { RolUsuario, User } from "src/app/shared/interfaces/user.model";
import { GAME_NOT_FOUND } from "src/app/shared/Constants";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly GAMES_STORAGE_KEY = 'games';
  private games: Game[] = [];

  constructor() {
    this.loadGamesFromStorage();
  }

  private loadGamesFromStorage(): void {
    const gamesJson = localStorage.getItem(this.GAMES_STORAGE_KEY);
    if (gamesJson) {
      this.games = JSON.parse(gamesJson);
    }
  }

  private saveGamesToStorage(): void {
    localStorage.setItem(this.GAMES_STORAGE_KEY, JSON.stringify(this.games));
  }

  joinGame(gameId: string, user: User): Observable<Game> {
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }

    if (game.players.length === 0) {
      user.rol = RolUsuario.ADMIN;
    }

    if (game.players.some(p => p.id === user.id)) {
      return throwError(() => new Error('User already joined the game'));
    }

    game.players.push(user);
    this.saveGamesToStorage();
    return of(game);
  }

  vote(gameId: string, userId: string, vote: number): Observable<Game> {
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }

    if (!game.players.some(p => p.id === userId)) {
      return throwError(() => new Error('User not part of the game'));
    }

    game.votes[userId] = vote;
    this.saveGamesToStorage();
    return of(game);
  }

  getResults(gameId: string): Observable<number> {
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }

    const totalVotes = Object.values(game.votes).reduce((acc, vote) => acc + vote, 0);
    const averageVote = totalVotes / Object.values(game.votes).length;
    return of(averageVote);
  }

  createGame(request: CreateGameRequest): Observable<Game> {
    const newGame: Game = {
      id: this.generateId(),
      name: request.name,
      players: [],
      state: "waiting",
      votes: {}
    };
    this.games.push(newGame);
    this.saveGamesToStorage();
    return of(newGame);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  AuthService(): string | null {
    return localStorage.getItem('userName');
  }

  getGameById(id: string): Observable<Game> {
    this.loadGamesFromStorage();
    const game = this.games.find(g => g.id === id);
    if (game) {
      return of(game);
    } else {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }
  }
}