import type { IteratorOptions } from 'fs-iterator';

export type { IteratorOptions, FilterCallback } from 'fs-iterator';
export interface Options extends IteratorOptions {}
export type Callback = (error?: Error) => undefined;
