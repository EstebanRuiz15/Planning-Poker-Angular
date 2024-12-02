import { throwError,Observable, of } from 'rxjs';
import { Game } from 'src/app/shared/interfaces/game.model';
import { Injectable } from "@angular/core";
import { CreateGameRequest } from 'src/app/shared/interfaces/game.model';
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

    if (game.players.length >= 8) {
      return throwError(() => new Error('Game is full'));
    }

    if (game.players.length === 0) {
      user.admin = true;

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

  playerVote(gameId: string, userId: string, vote: number): Observable<Game> {
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }
    game.votes[userId] = vote;

    const votedPlayers = Object.keys(game.votes).length;
    const totalPlayers = game.players.filter(p => p.rol === RolUsuario.PLAYER).length;

    if (votedPlayers === totalPlayers) {
      game.state = 'voted';
    }

    this.saveGamesToStorage();
    return of(game);
  }

  revealVotes(gameId: string): Observable<Game> {
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return throwError(() => new Error(GAME_NOT_FOUND));
    }

    game.state = 'completed';
    this.saveGamesToStorage();
    return of(game);
  }

  getCurrentUser(gameId: string, userName: string): User | undefined {
    const game = this.games.find(g => g.id === gameId);
    return game?.players.find(p => p.name === userName);
  }

  getGamePlayerCount(gameId: string, rol: RolUsuario): number {
    this.loadGamesFromStorage();
    const game = this.games.find(g => g.id === gameId);
    if (!game) {
      return 0
    }
    return game.players.filter(p => p.rol === rol).length;
  }

  isAdminUser(gameId: string, userName: string): boolean {
    const game = this.games.find(g => g.id === gameId);
    const currentUser = game?.players.find(p => p.name === userName);
    return currentUser?.admin || false;
  }

  resetGameVotesAndStatus(gameId: string):void {
    this.loadGamesFromStorage();
    const game = this.games.find(g => g.id === gameId);

    if (!game) {
      throwError(() => new Error(GAME_NOT_FOUND));
    }
    if(game){
    game.votes = {};
    game.state = 'waiting';

    this.saveGamesToStorage();
    }
  }

}
