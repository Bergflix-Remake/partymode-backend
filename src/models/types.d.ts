export interface IRoomPermissions {
  name: boolean;
  queue: boolean;
  owner: boolean;
  video: boolean;
  time: boolean;
  playback: boolean;
  permissions: boolean;
}

export interface IRoom {
  name: string;
  queue: string[];
  owner: string;
  currentVideo: string;
  currentTime: number;
  playing: boolean;
  permissions: {
    user: Partial<IRoomPermissions>;
    guest: Partial<IRoomPermissions>;
  }
}

export interface IUser {
  id: number;
  username: string;
  email?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  admin: boolean;
}

export interface BaseReturn<T = unknown> {
  error?: {
    message: string;
    code: number;
  };
  data?: T;
}