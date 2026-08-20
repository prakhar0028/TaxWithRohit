export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  flush(): Promise<void>;
}

export class InMemoryCacheService implements ICacheService {
  private cache: Map<string, { value: any; expiry: number | null }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

export class CacheService {
  private driver: ICacheService;

  constructor() {
    // If Redis URL is configured in production, connect Redis driver; otherwise fallback to fast in-memory
    this.driver = new InMemoryCacheService();
  }

  getDriver(): ICacheService {
    return this.driver;
  }
}

export const cacheService = new CacheService().getDriver();
