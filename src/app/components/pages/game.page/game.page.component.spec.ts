import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePageComponent } from './game.page.component';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { of } from 'rxjs';
import { Game } from 'src/app/shared/interfaces/game.model';

class MockGameService {
  getGameById = jest.fn().mockReturnValue(of({ id: '123', name: 'Test Game' }));
  joinGame = jest.fn().mockReturnValue(of({} as Game));
  AuthService = jest.fn().mockReturnValue('Test User');
}

describe('GamePageComponent', () => {
  let component: GamePageComponent;
  let fixture: ComponentFixture<GamePageComponent>;
  let gameService: MockGameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamePageComponent],
      providers: [
        { provide: GameService, useClass: MockGameService },
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['gameId', '123']])) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService) as unknown as MockGameService;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize fibonacciNumbers correctly', () => {
    const expectedFibonacci = [0, 1, 3, 5, 8, 13, 21, 34, 55, 89];
    expect(component.fibonacciNumbers).toEqual(expectedFibonacci);
  });

  it('should retrieve gameId from the route', () => {
    expect(component.gameId).toBe('123');
  });

  it('should fetch game details and set gameName when gameId is available', () => {
    const mockGame = { id: '123', name: 'Test Game' };
    gameService.getGameById = jest.fn().mockReturnValue(of(mockGame));

    component.ngOnInit();
    fixture.detectChanges();

    expect(gameService.getGameById).toHaveBeenCalledWith('123');
    expect(component.gameName).toBe('Test Game');
  });

  it('should get the correct initials for a name', () => {
    const initials = component.getInitials('Test User');
    expect(initials).toBe('TE');
  });

  it('should copy the invitation link to the clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    const clipboardWriteTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    component.gameId = 'testGameId';
    component.gameName = 'testGameName';
    component.copyInvitationLink();
    await fixture.detectChanges();

    const baseUrl = window.location.origin;
    const expectedLink = `${baseUrl}/register/testGameName/testGameId`;

    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(expectedLink);
  });

  it('should call AuthService to get the userName', () => {
    expect(component.userName).toBe('Test User');
  });
});
