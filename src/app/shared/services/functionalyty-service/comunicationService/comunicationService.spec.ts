import { TestBed } from '@angular/core/testing';
import { GameCommunicationService } from './comunicationService';
import { RolUsuario, User } from 'src/app/shared/interfaces/user.model';

describe('GameCommunicationService', () => {
  let service: GameCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameCommunicationService);

    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a player to the game', () => {
    const player: User = { id: '1', name: 'juan andres', gameId: 'game1', rol: RolUsuario.PLAYER, assigned: false };

    service.addPlayerToGame(player);

    expect(localStorage.getItem('currentPlayer')).toBe(JSON.stringify(player));

    const storedPlayers = service.getStoredPlayers(player.gameId);
    expect(storedPlayers).toEqual([player]);
  });

  it('should not add a player if they already exist in the game', () => {
    const player: User = { id: '1', name: 'juan andres', gameId: 'game1', rol: RolUsuario.PLAYER, assigned: false };

    service.addPlayerToGame(player);
    service.addPlayerToGame(player);

    const storedPlayers = service.getStoredPlayers(player.gameId);
    expect(storedPlayers.length).toBe(1);
    expect(storedPlayers).toEqual([player]);
  });

  it('should clear the game state', () => {
    const player: User = { id: '1', name: 'John Doe', gameId: 'game1', rol: RolUsuario.PLAYER, assigned: false };

    service.addPlayerToGame(player);
    service.clearState(player.gameId);

    expect(localStorage.getItem('currentPlayer')).toBeNull();
    expect(service.getStoredPlayers(player.gameId)).toEqual([]);
  });

  it('should load the stored player on initialization', () => {
    const player: User = { id: '1', name: 'John Doe', gameId: 'game1', rol: RolUsuario.PLAYER, assigned: false };
    localStorage.setItem('currentPlayer', JSON.stringify(player));

    const newService = TestBed.inject(GameCommunicationService);

    newService.player$.subscribe(storedPlayer => {
      expect(storedPlayer).toEqual(player);
    });
  });
});
