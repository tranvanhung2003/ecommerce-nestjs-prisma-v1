import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly saltRounds = 10;

  async hash(value: string) {
    return await hash(value, this.saltRounds);
  }

  async compare(value: string, hashedValue: string) {
    return await compare(value, hashedValue);
  }
}
