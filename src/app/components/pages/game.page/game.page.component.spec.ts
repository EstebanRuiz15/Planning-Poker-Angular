
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GamePageComponent } from './game.page.component';
import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { Game } from 'src/app/shared/interfaces/game.model';
import { RolUsuario, User } from '../../../shared/interfaces/user.model';

describe('GamePageComponent', () => {
  let component: GamePageComponent;
  let fixture: ComponentFixture<GamePageComponent>;
  let mockGameService: jest.Mocked<GameService>;
  let mockGameCommunicationService: jest.Mocked<GameCommunicationService>;
  let mockToastService: jest.Mocked<ToastService>;

  const mockGame:Game = {
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
    gameId:"123",
    assigned:false
  };

  beforeEach(async () => {
    const gameServiceMock = {
      getGameById: jest.fn(),
      AuthService: jest.fn(),
      isAdminUser: jest.fn(),
      getCurrentUser: jest.fn(),
      playerVote: jest.fn(),
      getGamePlayerCount: jest.fn(),
      revealVotes: jest.fn()
    };

    const gameCommunicationServiceMock = {
      player$: of(mockUser),
      updateGameVotes: jest.fn(),
      updateUserVote: jest.fn(),
      getStoredPlayers: jest.fn(),
      updateGameCompletedStatus: jest.fn(),
      notifyClearOverlays: jest.fn(),
      getLatestGameVotes: jest.fn()
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
        }
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
    it('should allow voting for a player', () => {
      component.vote(5);
      expect(mockGameService.playerVote).toHaveBeenCalledWith('game123', mockUser.id, 5);
      expect(component.currentUserVote).toBe(5);
    });

    it('should prevent voting twice', () => {
      component.vote(5);
      component.vote(8);
      expect(component.currentUserVote).toBe(5);
    });

    it('should check if user has player role', () => {
      expect(component.isPlayerRole()).toBe(true);
    });
  });

  describe('Vote Revealing', () => {
    it('should determine if votes can be revealed', () => {
      component.gameVotes = { 'user1': 5 };
      expect(component.canRevealVotes()).toBe(true);
    });

    it('should reveal votes', () => {
      component.revealVotes();
      expect(mockGameService.revealVotes).toHaveBeenCalledWith('game123');
      expect(component.isGameComplete).toBe(true);
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

    it('should count votes for each number correctly', () => {
      const uniqueVotes = component.getUniqueVotes();
      expect(uniqueVotes).toContainEqual({ vote: 5, count: 2 });
      expect(uniqueVotes).toContainEqual({ vote: 8, count: 1 });
    });

    it('should get votes for a specific number', () => {
      expect(component.getVotesForNumber(5)).toBe(2);
      expect(component.getVotesForNumber(8)).toBe(1);
    });
  });

  describe('Game Utilities', () => {
    it('should copy invitation link', () => {
      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');
      component.copyInvitationLink();
      expect(clipboardSpy).toHaveBeenCalled();
    });

    it('should restart game', () => {
      component.gameVotes = { 'user1': 5 };
      component.restartGame();
      expect(component.gameVotes).toEqual({});
    });
  });
});
