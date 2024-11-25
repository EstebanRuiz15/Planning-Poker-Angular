import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service.impl';
import { Game, CreateGameRequest } from 'src/app/shared/interfaces/game.model';
import { User, RolUsuario } from 'src/app/shared/interfaces/user.model';
import { GAME_NOT_FOUND } from 'src/app/shared/Constants';

describe('GameService', () => {
  let service: GameService;
  let localStorageMock: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameService]
    });
    service = TestBed.inject(GameService);

    localStorageMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      switch (key) {
        case 'games':
          return JSON.stringify([{
            id: 'game1',
            name: 'Test Game',
            players: [],
            state: 'waiting',
            votes: {}
          }]);
        case 'userName':
          return 'testUser';
        default:
          return null;
      }
    });

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new game', (done) => {
    const request: CreateGameRequest = { name: 'New Game' };
    service.createGame(request).subscribe((game: Game) => {
      expect(game.name).toBe('New Game');
      expect(service['games'].length).toBe(2);
      done();
    });
  });

  it('should join a game and assign admin role to first user', (done) => {
    const user: User = { id: 'user1', name: 'Test User', rol: RolUsuario.PLAYER, assigned: false, gameId: 'game1' };
    service.joinGame('game1', user).subscribe((game: Game) => {
      expect(game.players.length).toBe(1);
      expect(game.players[0].rol).toBe(RolUsuario.ADMIN);
      done();
    });
  });

  it('should throw error if joining a non-existing game', (done) => {
    const user: User = { id: 'user1', name: 'Test User', rol: RolUsuario.PLAYER, assigned: false, gameId: 'game2' };
    service.joinGame('game2', user).subscribe({
      error: (error) => {
        expect(error.message).toBe(GAME_NOT_FOUND);
        done();
      }
    });
  });

  it('should throw error if user already joined the game', (done) => {
    const user: User = { id: 'user1', name: 'Test User', rol: RolUsuario.PLAYER, assigned: false, gameId: 'game1' };
    service.joinGame('game1', user).subscribe(() => {
      service.joinGame('game1', user).subscribe({
        error: (error) => {
          expect(error.message).toBe('User already joined the game');
          done();
        }
      });
    });
  });

  it('should vote in a game', (done) => {
    const user: User = { id: 'user1', name: 'Test User', rol: RolUsuario.PLAYER, assigned: false, gameId: 'game1' };
    service.joinGame('game1', user).subscribe(() => {
      service.vote('game1', 'user1', 5).subscribe((game: Game) => {
        expect(game.votes['user1']).toBe(5);
        done();
      });
    });
  });

  it('should throw error if voting in a non-existing game', (done) => {
    service.vote('game2', 'user1', 5).subscribe({
      error: (error) => {
        expect(error.message).toBe(GAME_NOT_FOUND);
        done();
      }
    });
  });

  it('should get game results', (done) => {
    const user: User = { id: 'user1', name: 'Test User', rol: RolUsuario.PLAYER, assigned: false, gameId: 'game1' };
    service.joinGame('game1', user).subscribe(() => {
      service.vote('game1', 'user1', 5).subscribe(() => {
        service.getResults('game1').subscribe((averageVote: number) => {
          expect(averageVote).toBe(5);
          done();
        });
      });
    });
  });

  it('should throw error if getting results for a non-existing game', (done) => {
    service.getResults('game2').subscribe({
      error: (error) => {
        expect(error.message).toBe(GAME_NOT_FOUND);
        done();
      }
    });
  });

  it('should get a game by ID', (done) => {
    service.getGameById('game1').subscribe((game: Game) => {
      expect(game.name).toBe('Test Game');
      done();
    });
  });

  it('should throw error if getting a non-existing game by ID', (done) => {
    service.getGameById('game2').subscribe({
      error: (error) => {
        expect(error.message).toBe(GAME_NOT_FOUND);
        done();
      }
    });
  });

  it('should return the authenticated user name', () => {
    const userName = service.AuthService();
    expect(userName).toBe('testUser');
  });
});
