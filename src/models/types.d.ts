import { RedisClientType } from "redis";

export interface IRoomPermissions {
    canPlay: boolean;
    canPause: boolean;
    canSkip: boolean;
    canAdd: boolean;
    canRemove: boolean;
    canSync: boolean;
  }
  
  export interface IRoom {
    name: string;
    queue: string[];
    owner: string;
    currentVideo: string;
    currentTime: number;
    playing: boolean;
    permissions: {
      user: IRoomPermissions;
      guest: IRoomPermissions;
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