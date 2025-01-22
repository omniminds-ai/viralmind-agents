import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';

export class AWSS3Service {
  private client: S3Client;
  constructor(accessKeyId: string, secretAccessKey: string) {
    this.client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region: 'us-west-2'
    });
  }

  async saveItem(options: { name: string; file: Buffer | string; bucket?: string }) {
    let data: Buffer;
    // data is a file path
    if (typeof options.file === 'string') {
      data = await fs.readFile(options.file);
    } else {
      data = options.file;
    }
    const command = new PutObjectCommand({
      Bucket: options.bucket || 'training-gym',
      Body: data,
      Key: options.name
    });
    await this.client.send(command);
  }
}
