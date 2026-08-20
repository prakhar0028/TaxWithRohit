export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  fileName: string;
}

export interface IStorageProvider {
  uploadFile(buffer: Buffer | string, fileName: string, mimeType: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<boolean>;
  getDownloadUrl(key: string): Promise<string>;
}

export class LocalStorageProvider implements IStorageProvider {
  private files: Map<string, { data: string; mimeType: string; fileName: string; size: number }> = new Map();

  async uploadFile(buffer: Buffer | string, fileName: string, mimeType: string): Promise<UploadResult> {
    const key = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${fileName.replace(/\s+/g, '_')}`;
    const dataStr = typeof buffer === 'string' ? buffer : buffer.toString('base64');
    const size = typeof buffer === 'string' ? buffer.length : buffer.byteLength;

    this.files.set(key, { data: dataStr, mimeType, fileName, size });

    // Generate local download/preview URI
    const url = `/api/documents/preview/${key}`;
    return {
      url,
      key,
      size,
      mimeType,
      fileName,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    return this.files.delete(key);
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `/api/documents/preview/${key}`;
  }
}

export class CloudinaryStorageProvider implements IStorageProvider {
  constructor(private cloudName: string, private apiKey: string, private apiSecret: string) {}

  async uploadFile(buffer: Buffer | string, fileName: string, mimeType: string): Promise<UploadResult> {
    // Cloudinary SDK integration hook
    const key = `taxwithrohit/${Date.now()}_${fileName}`;
    return {
      url: `https://res.cloudinary.com/${this.cloudName}/raw/upload/v1/${key}`,
      key,
      size: typeof buffer === 'string' ? buffer.length : buffer.byteLength,
      mimeType,
      fileName,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    return true;
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `https://res.cloudinary.com/${this.cloudName}/raw/upload/v1/${key}`;
  }
}

export class StorageService {
  private provider: IStorageProvider;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      this.provider = new CloudinaryStorageProvider(cloudName, apiKey, apiSecret);
    } else {
      this.provider = new LocalStorageProvider();
    }
  }

  getProvider(): IStorageProvider {
    return this.provider;
  }
}

export const storageService = new StorageService();
