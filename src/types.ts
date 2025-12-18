import type { IteratorOptions } from 'fs-iterator';

export type { Entry, FilterFunction, IteratorOptions } from 'fs-iterator';
export interface Options extends IteratorOptions {}
export type Callback = (error?: Error) => void;
