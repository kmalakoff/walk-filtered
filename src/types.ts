import type { IteratorOptions } from 'fs-iterator';

export type { FilterCallback, IteratorOptions } from 'fs-iterator';
export interface Options extends IteratorOptions {}
export type Callback = (error?: Error) => undefined;
