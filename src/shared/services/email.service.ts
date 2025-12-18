import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import z from 'zod';
import envConfig from '../config';

const SendOtpSchema = z.object({
  email: z.email(),
  code: z.string(),
});

type SendOtpType = z.infer<typeof SendOtpSchema>;

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOtp(sendOtpData: SendOtpType) {
    const $sendOtpData = SendOtpSchema.parse(sendOtpData);

    const { email: _, code } = $sendOtpData;

    return await this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: ['tranvanhan29042007@gmail.com'],
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <strong>${code}</strong></p>`,
    });
  }
}
