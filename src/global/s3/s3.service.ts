import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { BadRequestException } from '../error/custom.exception';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  private readonly bucket: string;

  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET_NAME')!;

    this.region = this.configService.get<string>('AWS_REGION')!;

    this.s3Client = new S3Client({
      region: this.region,

      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY')!,

        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  async uploadDiaryImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = [];

    if (files.length === 0) {
      throw new BadRequestException('이미지를 선택해주세요.', 'EMPTY_IMAGE');
    }

    if (files.length > 3) {
      throw new BadRequestException(
        '이미지는 최대 3장까지 업로드 가능합니다.',
        'IMAGE_LIMIT_EXCEEDED',
      );
    }

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('이미지 파일만 업로드 가능합니다.');
      }

      const fileName = `diary/${randomUUID()}-${file.originalname}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      imageUrls.push(
        `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`,
      );
    }

    return imageUrls;
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('이미지 파일만 업로드 가능합니다.');
    }

    const fileName = `profile/${randomUUID()}-${file.originalname}`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // URL에서 S3 Key 추출
    const key = imageUrl.split('.amazonaws.com/')[1];
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
