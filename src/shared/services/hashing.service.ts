import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly SALT_ROUNDS = 10;

  async hash(value: string) {
    return await hash(value, this.SALT_ROUNDS);
  }

  async compare(value: string, hashedValue: string) {
    return await compare(value, hashedValue);
  }
}
