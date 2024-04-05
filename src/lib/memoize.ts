interface MemoizeOptions<TArgs extends any[], TResult> {
  shouldUpdate?: (args: TArgs, lastArgs: TArgs) => boolean;
  genKey: (...args: TArgs) => string;
}

export function memoize<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  { genKey, shouldUpdate = () => false }: MemoizeOptions<TArgs, TResult>,
): (...args: TArgs) => Promise<TResult> {
  if (!fn) throw new TypeError("You have to provide a `fn` function.");

  const cache = new Map<
    string,
    {
      value: TResult;
      lastArgs: TArgs;
    }
  >();

  return async (...args: TArgs): Promise<TResult> => {
    const key = genKey(...args);

    if (cache.has(key)) {
      const { value, lastArgs } = cache.get(key)!;
      if (!shouldUpdate(args, lastArgs)) {
        // console.debug(`  memoize ${fn.name}, key ${key}: cache hits`);
        return value;
      } else {
        // console.debug(`  memoize ${fn.name}, key ${key}: cache update.`);
      }
    } else {
      // console.debug(`  memoize ${fn.name}, key ${key}: cache miss.`);
    }

    try {
      const result = await fn(...args);
      cache.set(key, {
        value: result,
        lastArgs: args,
      });
      return result;
    } catch (e) {
      cache.delete(key);
      throw e;
    }
  };
}
