import {
  Cache as TSCache,
  ExpirationStrategy,
  MemoryStorage
} from "node-ts-cache";

const strategy = new ExpirationStrategy(new MemoryStorage());

export const Cache = TSCache.bind(null, strategy);
