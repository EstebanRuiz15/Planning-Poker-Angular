import { Game } from './../../../interfaces/game.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, fromEvent, map, Observable, Subject } from 'rxjs';
import { User } from 'src/app/shared/interfaces/user.model';
import { GameService } from '../GameService/game.service.impl';

@Injectable({
  providedIn: 'root'
})
export class GameCommunicationService {
  private readonly GAME_PLAYERS_KEY = 'game_table_players';
  private playerSubject = new BehaviorSubject<User | null>(null);
  player$ = this.playerSubject.asObservable();
  private playerColorChangeSubject = new Subject<{ playerId: string, color: string }>();
  playerColorChange$ = this.playerColorChangeSubject.asObservable();
  private playerVoteChangeSubject = new Subject<{ playerId: string, vote: number }>();
  playerVoteChange$ = this.playerVoteChangeSubject.asObservable();
  private gameStateSubject = new BehaviorSubject<'waiting' | 'voted' | 'completed'>('waiting');
  private gameCompleteSubject = new BehaviorSubject<{ gameId: string, isComplete: boolean }>({
    gameId: '',
    isComplete: false
  });
  gameComplete$ = this.gameCompleteSubject.asObservable();
  gameState$ = this.gameStateSubject.asObservable();
  private gameVotesSubject = new BehaviorSubject<{ [userId: string]: number }>({});
  gameVotes$ = this.gameVotesSubject.asObservable();
  private clearOverlaysSubject = new Subject<void>();
  clearOverlays$ = this.clearOverlaysSubject.asObservable();


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

  notifyPlayerColorChange(playerId: string, color: string, vote: number) {
    this.playerColorChangeSubject.next({ playerId, color });
    this.playerVoteChangeSubject.next({ playerId, vote });
  }
  notifyClearOverlays(): void {
    this.clearOverlaysSubject.next();
  }
  updateGameState(state: 'waiting' | 'voted' | 'completed') {
    console.log("state in service ", state)
    this.gameStateSubject.next(state);
  }

  updateGameCompletedStatus(gameId: string | null, isComplete: boolean){
    if (gameId) {
      localStorage.setItem(`game_complete_${gameId}`, JSON.stringify({
        gameId,
        isComplete,
        timestamp: Date.now()
      }));
    }
  }

  updateGameVotes(gameId: string, votes: { [userId: string]: number }) {
    localStorage.setItem(`game_votes_${gameId}`, JSON.stringify({
      votes: votes,
      timestamp: Date.now()
    }));

    this.gameVotesSubject.next(votes);
  }

  getLatestGameVotes(gameId: string|null): { [userId: string]: number } {
    const gameVotesStr = localStorage.getItem(`game_votes_${gameId}`);
    if (gameVotesStr) {
      const gameVotesData = JSON.parse(gameVotesStr);
      return gameVotesData.votes || {};
    }
    return {};
  }



}
