export enum RolUsuario {
  PLAYER = 'player',
  VIEWER= 'viwer',
  ADMIN='admin',
  VOID='',
}

export interface User {
  id: string;
  gameId: string;
  name: string;
  rol?: RolUsuario;
  admin?:boolean;
  assigned: boolean;
}
export interface CreateUserRequest {
  name: string;
  rol:RolUsuario;
}
