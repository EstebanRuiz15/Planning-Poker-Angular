import { GameService } from '../../../shared/services/functionalyty-service/GameService/game.service.impl';
import { Game } from 'src/app/shared/interfaces/game.model';
import { RolUsuario, User } from '../../../shared/interfaces/user.model';
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/services/Validators/CustomValidators';
import { ActivatedRoute, Router } from '@angular/router';
import { GameCommunicationService } from 'src/app/shared/services/functionalyty-service/comunicationService/comunicationService';
import { NAME_CANNOT_ONLY_NUMBERS, NAME_MAX_3_NUMBERS, NAME_MAX_LENGTH, NAME_MIN_LENGHT, NAME_NO_SPECIAL_CHARACTERS, NAME_REQUIERED } from 'src/app/shared/Constants';

@Component({
  selector: 'app-register-user',
  templateUrl: './register.user.component.html',
  styleUrls: ['./register.user.component.scss']
})
export class RegisterUserComponent implements OnInit, OnDestroy {
  private readonly USERS_STORAGE_KEY = 'game_users';
  userForm: FormGroup;
  @Output() createUser = new EventEmitter();
  showErrors = false;
  private errorTimeout: any;
  game: Game | null = null;
  hasPlayers = false;

  get nameControl(): FormControl {
    return this.userForm.get('name') as FormControl;
  }
  get roleControl(): FormControl {
    return this.userForm.get('role') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private gameService: GameService,
    private router: Router,
    private gameCommunicationService: GameCommunicationService
  ) {
    this.userForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        CustomValidators.gameNameValidator
      ]],
      role: ['spectator']
    });
  }

  private getStoredUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUserToStorage(user: User): void {
    const users = this.getStoredUsers();
    users.push(user);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private getUsersByGameId(gameId: string): User[] {
    const users = this.getStoredUsers();
    return users.filter(user => user.gameId === gameId);
  }

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('id');
    const gameName = this.route.snapshot.paramMap.get('name');

    if (gameId) {
      this.gameService.getGameById(gameId).subscribe({
        next: (game) => {
          this.game = game;
          const storedUsers = this.getUsersByGameId(gameId);
          this.hasPlayers = storedUsers.length > 0;
          if (!this.hasPlayers) {
            this.roleControl.setValue('admin');
          }
        },
        error: (err) => {
        }
      });
    }

    this.nameControl.valueChanges.subscribe(() => {
      if (this.nameControl.invalid) {
        this.nameControl.markAsTouched();
        this.showErrors = true;
        this.startErrorTimeout();
      }
    });
  }

  ngOnDestroy() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  startErrorTimeout() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this.errorTimeout = setTimeout(() => {
      this.showErrors = false;
    }, 4000);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const gameId = this.route.snapshot.paramMap.get('id') || '';
      const newUser: User = {
        id: this.generateId(),
        gameId: gameId,
        name: this.userForm.value.name,
        rol: this.userForm.value.role === 'player' ? RolUsuario.PLAYER : RolUsuario.VIEWER,
        assigned: false
      };
      this.handleCreateUser(newUser);
    }
  }

  handleCreateUser(newUser: User): void {
    const gameId = this.route.snapshot.paramMap.get('id');

    if (gameId) {
      this.gameService.joinGame(gameId, newUser).subscribe({
        next: (updatedGame) => {
          this.saveUserToStorage(newUser);

          this.gameCommunicationService.addPlayerToGame(newUser);
          localStorage.setItem('userName', newUser.name);
          localStorage.setItem('currentUserId', newUser.id);

          this.router.navigate(['/game', gameId]);
        },
        error: (err) => {
        }
      });
    }
  }

  isFieldInvalid(): boolean {
    return this.nameControl.invalid && (this.nameControl.touched || this.showErrors);
  }

  getErrorMessage(): string {
    if (!this.nameControl.errors || !this.showErrors) return '';

    if (this.nameControl.errors['required']) return NAME_REQUIERED;
    if (this.nameControl.errors['minlength']) return NAME_MIN_LENGHT;
    if (this.nameControl.errors['maxlength']) return NAME_MAX_LENGTH;
    if (this.nameControl.errors['specialCharacters']) return NAME_NO_SPECIAL_CHARACTERS;
    if (this.nameControl.errors['tooManyNumbers']) return NAME_MAX_3_NUMBERS;
    if (this.nameControl.errors['onlyNumbers']) return NAME_CANNOT_ONLY_NUMBERS;

    return '';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
