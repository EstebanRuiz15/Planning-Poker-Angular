import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { GamePageComponent } from './game.page.component';
import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { Game } from 'src/app/shared/interfaces/game.model';
import { RolUsuario, User } from '../../../shared/interfaces/user.model';
import { ChangeDetectorRef } from '@angular/core';
import { SERVICE_ERROR } from 'src/app/shared/Constants';

describe('GamePageComponent', () => {
  let component: GamePageComponent;
  let fixture: ComponentFixture<GamePageComponent>;
  let mockGameService: jest.Mocked<GameService>;
  let mockGameCommunicationService: jest.Mocked<GameCommunicationService>;
  let mockToastService: jest.Mocked<ToastService>;

  const mockGame: Game = {
    id: 'game123',
    name: 'Test Game',
    state: 'waiting',
    players: [],
    votes: {}
  };

  const mockUser: User = {
    id: 'user1',
    name: 'Test User',
    rol: RolUsuario.PLAYER,
    gameId: '123',
    assigned: false
  };

  beforeEach(async () => {
    const gameServiceMock = {
      getGameById: jest.fn(),
      AuthService: jest.fn(),
      isAdminUser: jest.fn(),
      getCurrentUser: jest.fn(),
      playerVote: jest.fn(),
      getGamePlayerCount: jest.fn(),
      revealVotes: jest.fn(),
      resetGameVotesAndStatus: jest.fn()
    };

    const gameCommunicationServiceMock = {
      player$: of(mockUser),
      updateGameVotes: jest.fn(),
      updateUserVote: jest.fn(),
      getStoredPlayers: jest.fn(),
      updateGameCompletedStatus: jest.fn(),
      notifyClearOverlays: jest.fn(),
      getLatestGameVotes: jest.fn(),
      resetGameState: jest.fn(),
      resetPlayerVotesSubject: new Subject<void>()
    };

    const toastServiceMock = {
      showToast: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [GamePageComponent],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        { provide: GameCommunicationService, useValue: gameCommunicationServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['gameId', 'game123']]))
          }
        },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageComponent);
    component = fixture.componentInstance;

    mockGameService = TestBed.inject(GameService) as jest.Mocked<GameService>;
    mockGameCommunicationService = TestBed.inject(GameCommunicationService) as jest.Mocked<GameCommunicationService>;
    mockToastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;

    mockGameService.getGameById.mockReturnValue(of(mockGame));
    mockGameService.AuthService.mockReturnValue('testUser');
    mockGameService.getCurrentUser.mockReturnValue(mockUser);
    mockGameService.isAdminUser.mockReturnValue(false);
    mockGameService.getGamePlayerCount.mockReturnValue(1);

    mockGameCommunicationService.getStoredPlayers.mockReturnValue([mockUser]);
    mockGameCommunicationService.getLatestGameVotes.mockReturnValue({});

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize game details on ngOnInit', () => {
    expect(component.gameId).toBe('game123');
    expect(component.gameName).toBe('Test Game');
    expect(component.gameState).toBe('waiting');
  });

  it('should generate correct Fibonacci numbers', () => {
    const fibNumbers = component.generateFibonacciUpTo89();
    expect(fibNumbers).toEqual([0, 1, 3, 5, 8, 13, 21, 34, 55, 89]);
  });

  it('should get initials correctly', () => {
    expect(component.getInitials('John Doe')).toBe('JO');
    expect(component.getInitials('Alice')).toBe('AL');
  });

  describe('Voting Functionality', () => {

    it('should check if user has player role', () => {
      expect(component.isPlayerRole()).toBe(true);
    });

    it('should not allow voting if user already voted', () => {
      component.currentUserVote = 5;
      component.vote(8);
      expect(mockGameService.playerVote).not.toHaveBeenCalled();
    });

    it('should handle voting error', () => {
      mockGameService.playerVote.mockReturnValue(throwError(() => new Error('Vote error')));

      component.vote(5);

      expect(mockToastService.showToast).toHaveBeenCalledWith(SERVICE_ERROR, 'error');
    });

    it('should return false for isPlayerRole when no game or user', () => {
      component.gameId = null;
      component.userName = null;

      expect(component.isPlayerRole()).toBe(false);
    });
  });


  describe('Vote Analysis', () => {
    beforeEach(() => {
      component.gameVotes = {
        'user1': 5,
        'user2': 8,
        'user3': 5
      };
    });

    it('should calculate average vote correctly', () => {
      const averageVote = component.getAverageVote();
      expect(averageVote).toBe(6);
    });

    it('should get votes for a specific number', () => {
      expect(component.getVotesForNumber(5)).toBe(2);
      expect(component.getVotesForNumber(8)).toBe(1);
    });
  });

  describe('Game Utilities', () => {
    it('should copy invitation link', () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });

      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');
      component.copyInvitationLink();
      expect(clipboardSpy).toHaveBeenCalled();
    });
    it('should get 0 average vote when no votes', () => {
      component.gameVotes = {};

      expect(component.getAverageVote()).toBe(0);
    });

    it('should handle getCurrentUserVote with no votes', () => {
      mockGameService.getCurrentUser.mockReturnValue(undefined);

      const result = component.getCurrentUserVote();

      expect(result).toEqual({ vote: null, id: '' });
    });

    it('should handle getUniqueVotes with no votes', () => {
      component.gameVotes = {};

      const result = component.getUniqueVotes();

      expect(result).toEqual([]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      const subscriptionSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
      component.ngOnDestroy();
      expect(subscriptionSpy).toHaveBeenCalled();
    });
  });

  describe('checkAdminStatus', () => {
    it('should determine if the user is an admin', () => {
      component.checkAdminStatus();
      expect(mockGameService.isAdminUser).toHaveBeenCalledWith('game123', 'testUser');
    });
  });

  describe('onCardSelected', () => {
    it('should update user votes and stored players', () => {
      component.onCardSelected('user1', 'game123', 5);
      expect(mockGameCommunicationService.updateUserVote).toHaveBeenCalledWith('user1', 'game123', 5);
      expect(component.users).toEqual([mockUser]);
    });
  });

  describe('getCurrentUserVote', () => {
    it('should get the current user vote', () => {
      component.gameVotes = { 'user1': 5 };
      const currentUserVote = component.getCurrentUserVote();
      expect(currentUserVote).toEqual({ vote: 5, id: 'user1' });
    });
  });

  describe('getUniqueVotes', () => {
    it('should get unique votes', () => {
      component.gameVotes = { 'user1': 5, 'user2': 8, 'user3': 5 };
      const uniqueVotes = component.getUniqueVotes();
      expect(uniqueVotes).toEqual([{ vote: 5, count: 2 }, { vote: 8, count: 1 }]);
    });
  });

  describe('Local Storage Events', () => {
    it('should handle game completion event', () => {
      const storageEvent = new StorageEvent('storage', {
        key: 'game_complete_game123',
        newValue: JSON.stringify({ gameId: 'game123', isComplete: true })
      });
      window.dispatchEvent(storageEvent);
      expect(component.isGameComplete).toBe(true);
    });

    it('should handle game restart event', () => {
      const storageEvent = new StorageEvent('storage', {
        key: 'game_restart_game123',
        newValue: 'true'
      });
      window.dispatchEvent(storageEvent);
      expect(component.gameVotes).toEqual({});
    });
  });

  describe('Admin and Game Control', () => {
    it('should return false for canRevealVotes when no game id', () => {
      component.gameId = null;

      expect(component.canRevealVotes()).toBe(false);
    });

    it('should canRevealVotes correctly when votes match player count', () => {
      mockGameService.getGamePlayerCount.mockReturnValue(2);
      component.gameVotes = { 'user1': 5, 'user2': 8 };
      component.gameState = 'voted';

      expect(component.canRevealVotes()).toBe(true);
    });

    it('should handle checkAdminStatus with no user', () => {
      mockGameService.AuthService.mockReturnValue(null);

      component.checkAdminStatus();

      expect(component.isAdmin).toBe(false);
    });
  });

  describe('Game Restart', () => {
    it('should handle game restart with no game id', () => {
      component.gameId = null;

      component.restartGame();

      expect(mockGameCommunicationService.resetGameState).not.toHaveBeenCalled();
    });
  });

  describe('Local Storage Events', () => {
    it('should handle game restart event with no game id', () => {
      const storageEvent = new StorageEvent('storage', {
        key: 'game_restart_',
        newValue: JSON.stringify({ gameId: null })
      });

      window.dispatchEvent(storageEvent);

    });
  });
});
