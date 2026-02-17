declare module 'hyperswarm' {
  import { EventEmitter } from 'events';

  interface JoinOptions {
    server?: boolean;
    client?: boolean;
  }

  interface Discovery {
    flushed(): Promise<void>;
  }

  class Hyperswarm extends EventEmitter {
    constructor(opts?: Record<string, unknown>);
    join(topic: Buffer, opts?: JoinOptions): Discovery;
    leave(topic: Buffer): Promise<void>;
    destroy(): Promise<void>;
  }

  export = Hyperswarm;
}

declare module 'b4a' {
  export function toString(buf: Buffer | Uint8Array, encoding?: string): string;
  export function from(input: string | Buffer | Uint8Array, encoding?: string): Buffer;
  export function alloc(size: number, fill?: number): Buffer;
  export function isBuffer(value: unknown): boolean;
}
