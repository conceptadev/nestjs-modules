import { PlainLiteralObject } from '@nestjs/common';

export interface AppContextInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  has(key: keyof T): boolean;
  register<K extends keyof T & string>(
    key: K,
    value: T[K],
  ): this & Record<K, T[K]>;
}

export interface AppContextMergeInterface {
  merge<T extends PlainLiteralObject>(
    factory: (has: (key: keyof T) => boolean) => Partial<T>,
    ctx?: AppContextInterface<T> | Partial<T>,
  ): AppContextInterface<T> & T;
  mergeAsync<T extends PlainLiteralObject>(
    factory: (has: (key: keyof T) => boolean) => Promise<Partial<T>>,
    ctx?: AppContextInterface<T> | Partial<T>,
  ): Promise<AppContextInterface<T> & T>;
}
