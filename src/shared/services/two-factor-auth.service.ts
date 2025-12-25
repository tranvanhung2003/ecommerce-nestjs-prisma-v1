import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import envConfig from '../config';

interface VerifyTotpPayload {
  email: string;
  secret: string;
  token: string;
}

@Injectable()
export class TwoFactorAuthService {
  private createTotp(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTotpSecret(email: string) {
    const totp = this.createTotp(email);

    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  }

  verifyTotp({ email, secret, token }: VerifyTotpPayload): boolean {
    const totp = this.createTotp(email, secret);
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  }
}
