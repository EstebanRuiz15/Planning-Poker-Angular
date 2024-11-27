import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { User } from '../../../shared/interfaces/user.model';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { ActivatedRoute } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-table-game',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableGameComponent implements OnInit, OnDestroy {
  @Input() votedCards: { [userId: string]: number } = {};
  @Input() currentUserVote: { vote: number | null, id: string | null }= { vote: null, id: null };
  private readonly TABLE_STATE_KEY = 'game_table_state';
  private gameId: string | null = null;
  private subscriptions: Subscription = new Subscription();

  players: {
    id: string;
    name: string;
    assigned: boolean;
    rol?: string;
    order: number;
    userId?:string
  }[] = [
    { id: 'center', name: '', assigned: false, rol: '', order: 1 },
    { id: 'bottom-center', name: '', assigned: false, rol: '', order: 2 },
    { id: 'left-side', name: '', assigned: false, rol: '', order: 3 },
    { id: 'right-side', name: '', assigned: false, rol: '', order: 4 },
    { id: 'side-top-left', name: '', assigned: false, rol: '', order: 5 },
    { id: 'side-top-right', name: '', assigned: false, rol: '', order: 6 },
    { id: 'bottom-left-1', name: '', assigned: false, rol: '', order: 7 },
    { id: 'bottom-right-1', name: '', assigned: false, rol: '', order: 8 }
  ];

  constructor(
    private gameCommunicationService: GameCommunicationService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {

   }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('gameId');

    if (this.gameId) {
      this.initializeGameState();
      this.setupStorageListener();
      this.setupPlayerSubscription();
    }
  }

  private initializeGameState(): void {
    this.loadTableState();
    const storedPlayers = this.gameCommunicationService.getStoredPlayers(this.gameId!);
    this.resetPlayers();
    storedPlayers.forEach(player => {
      if (!this.isPlayerAssigned(player)) {
        this.assignPlayer(player);
      }
    });
  }

  private setupStorageListener(): void {
    this.subscriptions.add(
      fromEvent(window, 'storage').subscribe((event: any) => {
        if (event.key === `${this.TABLE_STATE_KEY}_${this.gameId}`) {
          this.ngZone.run(() => {
            this.loadTableState();
          });
        }
      })
    );
  }

  private setupPlayerSubscription(): void {
    this.subscriptions.add(
      this.gameCommunicationService.player$.subscribe(player => {
        if (player && !this.isPlayerAssigned(player)) {
          this.assignPlayer(player);
          this.notifyPlayersUpdate();
        }
      })
    );
  }

  private notifyPlayersUpdate(): void {
    localStorage.setItem('last_update_' + this.gameId, Date.now().toString());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private resetPlayers(): void {
    this.players.forEach(player => {
      player.name = '';
      player.assigned = false;
      player.rol = '';
    });
  }

  getPlayerCardOverlay(playerId: string): string | null {

    const player = this.getPlayerByID(playerId);

    if (!player) return null;
    if (this.currentUserVote.vote !== null && this.currentUserVote.id == player.userId) {
      return 'rgba(219, 96, 213, 0.788)';
    }

    return null;
  }

  getPlayerCardText(playerId: string): string | null {
    const player = this.getPlayerByID(playerId);
    if (!player) return null;

    if (this.votedCards && Object.keys(this.votedCards).length > 0) {
      return this.votedCards[player.id]?.toString() || null;
    }

    return null;
  }

  private loadTableState(): void {
    if (!this.gameId) return;

    const savedState = localStorage.getItem(`${this.TABLE_STATE_KEY}_${this.gameId}`);
    if (savedState) {
      const newPlayers = JSON.parse(savedState);

      if (JSON.stringify(this.players) !== JSON.stringify(newPlayers)) {
        this.players = newPlayers;
      }
    }
  }

  private saveTableState(): void {
    if (!this.gameId) return;
    localStorage.setItem(`${this.TABLE_STATE_KEY}_${this.gameId}`, JSON.stringify(this.players));
    this.notifyPlayersUpdate();
  }

  private isPlayerAssigned(user: User): boolean {
    return this.players.some(player =>
      player.name === user.name &&
      player.assigned
    );
  }

  assignPlayer(user: User) {
    if (this.isPlayerAssigned(user)) {
      return;
    }

    const unassignedPlayer = this.players
      .filter(player => !player.assigned)
      .sort((a, b) => a.order - b.order)[0];

    if (unassignedPlayer) {
      unassignedPlayer.name = user.name;
      unassignedPlayer.assigned = true;
      unassignedPlayer.rol = user.rol;
      unassignedPlayer.userId=user.id;
      this.saveTableState();
    }
  }

  getPlayerForPosition(id: string): string | null {
    const player = this.getAssignedPlayers().find(p => p.id === id);
    return player ? player.name : null;
  }

  getPlayerByID(id: string) {
    return this.players.find(player => player.id === id);
  }

  getAssignedPlayers(): {id: string, name: string}[] {
    return this.players
      .filter(player => player.assigned)
      .map(player => ({ id: player.id, name: player.name }));
  }
}
