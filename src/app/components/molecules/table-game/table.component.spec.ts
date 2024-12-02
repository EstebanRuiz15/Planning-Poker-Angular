import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableGameComponent } from './table.component';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { GameService } from 'src/app/shared/services/functionalyty-service/GameService/game.service.impl';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RolUsuario, User } from 'src/app/shared/interfaces/user.model';

describe('TableGameComponent', () => {
  let component: TableGameComponent;
  let fixture: ComponentFixture<TableGameComponent>;
  let mockGameCommunicationService: any;
  let mockGameService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockGameCommunicationService = {
      player$: new Subject<User>(),
      clearOverlays$: new Subject<void>(),
      playerColorChange$: new Subject<{ playerId: string, color: string }>(),
      playerVoteChange$: new Subject<{ playerId: string, vote: number }>(),
      getStoredPlayers: jest.fn().mockReturnValue([]),
      notifyPlayerColorChange: jest.fn()
    };

    mockGameService = {
      getGameById: jest.fn().mockReturnValue(of({ state: 'active' }))
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('test-game-id')
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ TableGameComponent ],
      providers: [
        { provide: GameCommunicationService, useValue: mockGameCommunicationService },
        { provide: GameService, useValue: mockGameService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableGameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize players with default values', () => {
    expect(component.players.length).toBe(8);
    component.players.forEach(player => {
      expect(player.name).toBe('');
      expect(player.assigned).toBe(false);
      expect(player.rol).toBe('');
    });
  });

  describe('Player Assignment', () => {
    const mockUser: User = {
      id: 'user1',
      name: 'Test User',
      rol: RolUsuario.PLAYER,
      gameId: 'test-game-id',
      assigned: false
    };

    it('should assign a player to an unassigned position', () => {
      component.assignPlayer(mockUser);
      const assignedPlayer = component.players.find(p => p.name === mockUser.name);

      expect(assignedPlayer).toBeTruthy();
      expect(assignedPlayer?.name).toBe(mockUser.name);
      expect(assignedPlayer?.assigned).toBe(true);
      expect(assignedPlayer?.rol).toBe(mockUser.rol);
      expect(assignedPlayer?.userId).toBe(mockUser.id);
    });

    it('should not assign a player already assigned', () => {
      component.assignPlayer(mockUser);
      const initialAssignedPlayer = component.players.find(p => p.name === mockUser.name);

      component.assignPlayer(mockUser);
      const assignedPlayersWithSameName = component.players.filter(p => p.name === mockUser.name);

      expect(assignedPlayersWithSameName.length).toBe(1);
    });


    it('should handle player assignment when multiple positions are available', () => {
      const players: User[] = [
        { id: 'user1', name: 'Player 1', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false },
        { id: 'user2', name: 'Player 2', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false }
      ];

      players.forEach(player => component.assignPlayer(player));

      const assignedPlayers = component.getAssignedPlayers();
      expect(assignedPlayers.length).toBe(2);
      expect(assignedPlayers[0].name).toBe('Player 1');
      expect(assignedPlayers[1].name).toBe('Player 2');
    });

    it('should assign players in correct order based on their order property', () => {
      const players: User[] = [
        { id: 'user1', name: 'Player 1', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false },
        { id: 'user2', name: 'Player 2', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false }
      ];

      players.forEach(player => component.assignPlayer(player));

      const assignedPlayers = component.players.filter(p => p.assigned);
      expect(assignedPlayers[0].id).toBe('center');
      expect(assignedPlayers[1].id).toBe('bottom-center');
    });
  });

  describe('Player Retrieval Methods', () => {
    beforeEach(() => {
      const mockUsers: User[] = [
        { id: 'user1', name: 'Player 1', rol: RolUsuario.PLAYER, gameId: 'test-game-id' , assigned:false},
        { id: 'user2', name: 'Player 2', rol: RolUsuario.VIEWER, gameId: 'test-game-id', assigned:false }
      ];
      mockUsers.forEach(user => component.assignPlayer(user));
    });

    it('should get player by ID', () => {
      const player = component.getPlayerByID('center');
      expect(player).toBeTruthy();
      expect(player?.id).toBe('center');
    });

    it('should get assigned players', () => {
      const assignedPlayers = component.getAssignedPlayers();
      expect(assignedPlayers.length).toBeGreaterThan(0);
      assignedPlayers.forEach(player => {
        expect(player.name).not.toBe('');
      });
    });
  });

  describe('Player Card Overlay', () => {

    it('should clear all player overlays', () => {
      component.players.forEach((player, index) => {
        player.overlay = `color-${index}`;
      });

      component.clearAllPlayerOverlays();

      component.players.forEach(player => {
        expect(player.overlay).toBeNull();
      });
    });

    it('should call notifyPlayerColorChange when player color changes', () => {
      const mockUser: User = {
        id: 'user1',
        name: 'Test User',
        rol: RolUsuario.PLAYER,
        gameId: 'test-game-id',
        assigned: false
      };

      component.assignPlayer(mockUser);
      const color = 'rgba(255, 0, 0, 0.5)';
      component.gameCommunicationService.notifyPlayerColorChange = jest.fn();

      component.gameCommunicationService.notifyPlayerColorChange('user1', color, 0);

      expect(component.gameCommunicationService.notifyPlayerColorChange).toHaveBeenCalledWith('user1', color, 0);
    });

  });
  describe('Lifecycle and Subscriptions', () => {
    it('should unsubscribe on component destruction', () => {
      const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('Player Management Extended', () => {
    it('should handle multiple player assignments to different positions', () => {
      const players: User[] = [
        { id: 'user1', name: 'Player 1', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false },
        { id: 'user2', name: 'Player 2', rol: RolUsuario.PLAYER, gameId: 'test-game-id', assigned: false },
        { id: 'user3', name: 'Player 3', rol: RolUsuario.VIEWER, gameId: 'test-game-id', assigned: false }
      ];

      players.forEach(player => component.assignPlayer(player));

      const assignedPlayers = component.getAssignedPlayers();
      expect(assignedPlayers.length).toBe(3);
      expect(assignedPlayers.map(p => p.name)).toContain('Player 1');
      expect(assignedPlayers.map(p => p.name)).toContain('Player 2');
      expect(assignedPlayers.map(p => p.name)).toContain('Player 3');
    });

    it('should prevent reassignment of an already assigned player', () => {
      const player: User = {
        id: 'user1',
        name: 'Player 1',
        rol: RolUsuario.PLAYER,
        gameId: 'test-game-id',
        assigned: false
      };

      component.assignPlayer(player);
      const firstAssignedPosition = component.getAssignedPlayers()[0];

      component.assignPlayer(player);
      const assignedPlayers = component.getAssignedPlayers();

      expect(assignedPlayers.length).toBe(1);
      expect(assignedPlayers[0].id).toBe(firstAssignedPosition.id);
    });



  });

  describe('Player Card Overlay Advanced', () => {
    it('should handle player card overlay with current user vote', () => {
      const player: User = {
        id: 'user1',
        name: 'Player 1',
        rol: RolUsuario.PLAYER,
        gameId: 'test-game-id',
        assigned: false
      };

      component.assignPlayer(player);
      component.currentUserVote = { vote: 5, id: 'user1' };

      const overlayInfo = component.getPlayerCardOverlay('center');

      expect(overlayInfo.overlay).toBe('rgba(219, 96, 213, 0.788)');
      expect(overlayInfo.vote).toBe(5);
    });

    it('should clear overlays for all players', () => {
      component.players.forEach((player, index) => {
        player.overlay = `color-${index}`;
      });

      component.clearAllPlayerOverlays();

      component.players.forEach(player => {
        expect(player.overlay).toBeNull();
      });
    });

  });

  describe('Storage and State Management', () => {
    beforeEach(() => {
      const localStorageMock = (() => {
        let store: {[key: string]: string} = {};
        return {
          getItem: jest.fn(key => store[key] || null),
          setItem: jest.fn((key, value) => {
            store[key] = value.toString();
          }),
          clear: jest.fn(() => {
            store = {};
          })
        };
      })();

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    });

    it('should load and save table state correctly', () => {
      const player: User = {
        id: 'user1',
        name: 'Player 1',
        rol: RolUsuario.PLAYER,
        gameId: 'test-game-id',
        assigned: false
      };

      component.assignPlayer(player);

      const storageEvent = new Event('storage');
      Object.defineProperty(storageEvent, 'key', { value: 'game_table_state_test-game-id' });

      window.dispatchEvent(storageEvent);
    });
  });

  it('should unsubscribe from all observables on ngOnDestroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should return null for unassigned position', () => {
    const playerName = component.getPlayerForPosition('side-top-left');
    expect(playerName).toBeNull();
  });

  it('should return player name for assigned position', () => {
    const mockUser: User = {
      id: 'user1',
      name: 'Test User',
      rol: RolUsuario.PLAYER,
      gameId: 'test-game-id',
      assigned: false
    };

    component.assignPlayer(mockUser);
    const playerName = component.getPlayerForPosition('center');
    expect(playerName).toBe('Test User');
  });

  it('should return null overlay for non-existent player', () => {
    const overlayInfo = component.getPlayerCardOverlay('non-existent');
    expect(overlayInfo.overlay).toBeNull();
    expect(overlayInfo.vote).toBeNull();
  });

  it('should return existing overlay for a player', () => {
    const player: User = {
      id: 'user1',
      name: 'Player 1',
      rol: RolUsuario.PLAYER,
      gameId: 'test-game-id',
      assigned: false
    };

    component.assignPlayer(player);
    const playerWithId = component.getPlayerByID('center');
    if (playerWithId) {
      playerWithId.overlay = 'test-color';
      playerWithId.vote = 3;
    }

    const overlayInfo = component.getPlayerCardOverlay('center');
    expect(overlayInfo.overlay).toBe('test-color');
    expect(overlayInfo.vote).toBe(3);
  });

    describe('Player Interactions', () => {
      it('should handle multiple player assignments with different roles', () => {
        const players: User[] = [
          {
            id: 'user1',
            name: 'Player 1',
            rol: RolUsuario.PLAYER,
            gameId: 'test-game-id',
            assigned: false
          },
          {
            id: 'user2',
            name: 'Viewer 1',
            rol: RolUsuario.VIEWER,
            gameId: 'test-game-id',
            assigned: false
          }
        ];

        players.forEach(player => component.assignPlayer(player));

        const assignedPlayers = component.getAssignedPlayers();
        expect(assignedPlayers.length).toBe(2);
        expect(assignedPlayers.some(p => p.name === 'Player 1')).toBeTruthy();
        expect(assignedPlayers.some(p => p.name === 'Viewer 1')).toBeTruthy();
      });

      it('should not reassign a player to multiple positions', () => {
        const player: User = {
          id: 'user1',
          name: 'Player 1',
          rol: RolUsuario.PLAYER,
          gameId: 'test-game-id',
          assigned: false
        };

        component.assignPlayer(player);
        const initialAssignedPlayer = component.getAssignedPlayers()[0];

        component.assignPlayer(player);
        const assignedPlayers = component.getAssignedPlayers();

        expect(assignedPlayers.length).toBe(1);
        expect(assignedPlayers[0].id).toBe(initialAssignedPlayer.id);
      });
    });

    describe('Voting and Overlay Interactions', () => {
      it('should handle vote overlay for non-completed game', () => {
        const player: User = {
          id: 'user1',
          name: 'Player 1',
          rol: RolUsuario.PLAYER,
          gameId: 'test-game-id',
          assigned: false
        };

        component.assignPlayer(player);
        component.currentUserVote = { vote: 5, id: 'user1' };


        const overlayInfo = component.getPlayerCardOverlay('center');
        expect(overlayInfo.overlay).toBe('rgba(219, 96, 213, 0.788)');
        expect(overlayInfo.vote).toBe(5);
      });

      it('should return null for non-existent player overlay', () => {
        const overlayInfo = component.getPlayerCardOverlay('non-existent');
        expect(overlayInfo.overlay).toBeNull();
        expect(overlayInfo.vote).toBeNull();
      });
    });

    describe('Player Position Queries', () => {
      it('should return null for unassigned position', () => {
        const playerName = component.getPlayerForPosition('side-top-left');
        expect(playerName).toBeNull();
      });

      it('should return player name for assigned position', () => {
        const mockUser: User = {
          id: 'user1',
          name: 'Test User',
          rol: RolUsuario.PLAYER,
          gameId: 'test-game-id',
          assigned: false
        };

        component.assignPlayer(mockUser);
        const playerName = component.getPlayerForPosition('center');
        expect(playerName).toBe('Test User');
      });
    });

  });
