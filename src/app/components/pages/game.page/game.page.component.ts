import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolUsuario, User } from 'src/app/shared/interfaces/user.model';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { TableGameComponent } from '../../molecules/table-game/table.component';

@Component({
  selector: 'app-game-page',
  templateUrl: './game.page.component.html',
  styleUrls: ['./game.page.component.scss']
})
export class GamePageComponent implements OnInit, OnDestroy {
  gameName: string | null = null;
  userName: string | null = null;
  gameId: string | null = null;
  gameState: 'waiting' | 'voted' | 'completed' = 'waiting';
  gameVotes: { [userId: string]: number } = {};
  isAdmin = false;
  isGameComplete:boolean=false;
  currentUserVote: number | null = null;
  player$ = this.gameCommunicationService.player$;
  users: User[] = [];
  revealedCards: { [userId: string]: number } = {};
  fibonacciNumbers: number[] = this.generateFibonacciUpTo89();

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private gameCommunicationService: GameCommunicationService,
    private changeDetectorRef:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('game_complete_') && event.newValue) {
        const gameCompleteData = JSON.parse(event.newValue);
        if (gameCompleteData.gameId === this.gameId) {
          this.isGameComplete = gameCompleteData.isComplete;
          this.gameVotes= this.gameCommunicationService.getLatestGameVotes(this.gameId);
          this.gameCommunicationService.notifyClearOverlays();
          console.log("estos son los votos y estado: ",this.gameVotes, this.isGameComplete)
          this.changeDetectorRef.detectChanges();
        }
      }
    });

    this.subscriptions.add(
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
      })
    );

    this.subscriptions.add(
      this.gameCommunicationService.gameComplete$.subscribe(status => {
        if (status.gameId === this.gameId) {
          this.isGameComplete = status.isComplete;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  checkAdminStatus(): void {
    this.userName = this.gameService.AuthService();
    console.log('game current ', this.gameId, this.userName);
    if (this.gameId && this.userName) {
      this.isAdmin = this.gameService.isAdminUser(this.gameId, this.userName);
    }
  }

  getInitials(name: string): string {
    const firstWord = name.split(' ')[0];
    const initials = firstWord.substring(0, 2);
    return initials.toUpperCase();
  }

  vote(vote: number): void {
    console.log(`User ${this.userName} is voting with value ${vote}`);
    if (this.currentUserVote !== null) {
      console.log('User has already voted and cannot vote again.');
      return;
    }
    if (this.gameId && this.userName) {
      const currentUser = this.gameService.getCurrentUser(this.gameId, this.userName);

      if (currentUser && currentUser.rol === RolUsuario.PLAYER) {
        console.log(`Current user found: ${currentUser.id}`);

        this.subscriptions.add(
          this.gameService.playerVote(this.gameId, currentUser.id, vote).subscribe({
            next: (game) => {
              this.currentUserVote = vote;
              this.gameVotes = game.votes;
              this.gameState = game.state;
              if(this.gameId)
            this.gameCommunicationService.updateGameVotes(this.gameId, game.votes);

              console.log(`Vote recorded for user ${currentUser.id}: ${vote}`);
              console.log(`Updated game votes:`, this.gameVotes);
              this.onCardSelected(currentUser.id, this.gameId!, vote);
            },
            error: (err) => {
              console.error(`Error recording vote for user ${currentUser.id}:`, err);
            }
          })
        );
      } else {
        console.log('User does not have player role and cannot vote');
      }
    }
  }

  isPlayerRole(): boolean {
    if (this.gameId && this.userName) {
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
    console.log(`disable button revelar`, playerCount, votedCount, "game vote ", this.gameVotes, "get game player count ", this.gameService.getGamePlayerCount(this.gameId, RolUsuario.PLAYER));

    return playerCount === votedCount && this.gameState === 'voted';
  }

  revealVotes(): void {
    if (this.gameId) {
      this.subscriptions.add(
        this.gameService.revealVotes(this.gameId).subscribe({
          next: (game) => {
            this.gameState = game.state;
            this.gameVotes = game.votes;
            this.isGameComplete = true;
            this.changeDetectorRef.detectChanges();
            if(this.gameId)
            this.gameCommunicationService.updateGameCompletedStatus(this.gameId, true);
            this.gameCommunicationService.notifyClearOverlays();
            console.log("this is mi game: ", game)
          }
        })
      );
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
  getAverageVote(): number {
    const votes = Object.values(this.gameVotes).filter(vote => typeof vote === 'number');
    const sum = votes.reduce((a, b) => a + b, 0);
    return votes.length ? sum / votes.length : 0;
  }

  getUniqueVotes(): { vote: number, count: number }[] {
    const voteCounts: { [key: number]: number } = {};

    for (const vote of Object.values(this.gameVotes)) {
      if (typeof vote === 'number') {
        if (!voteCounts[vote]) {
          voteCounts[vote] = 0;
        }
        voteCounts[vote]++;
      }
    }

    return Object.keys(voteCounts).map(vote => ({
      vote: Number(vote),
      count: voteCounts[Number(vote)]
    }));
  }

  restartGame() {
    this.gameVotes = {};
  }

  get objectKeys() {
    return Object.keys;
  }


}
