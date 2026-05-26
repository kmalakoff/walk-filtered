export * from './types.ts';
import type { Callback, FilterFunction, Options } from './types.ts';
export default function walk(root: string, filter: FilterFunction): Promise<void>;
export default function walk(root: string, filter: FilterFunction, options: Options): Promise<void>;
export default function walk(root: string, filter: FilterFunction, callback: Callback): void;
export default function walk(root: string, filter: FilterFunction, options: Options, callback: Callback): void;
