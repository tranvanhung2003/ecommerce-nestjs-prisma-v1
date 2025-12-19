import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import z from 'zod';
import envConfig from '../config';

const SendOtpSchema = z.object({
  email: z.email(),
  code: z.string(),
});

type SendOtpPayload = z.infer<typeof SendOtpSchema>;

@Injectable()
export class EmailService {
  private readonly fromEmail: string;
  private readonly resend: Resend;

  constructor() {
    this.fromEmail = `Ecommerce <noreply@${envConfig.RESEND_DOMAIN_NAME}>`;
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOtp(sendOtpPayload: SendOtpPayload) {
    const $sendOtpPayload = SendOtpSchema.parse(sendOtpPayload);

    const { email, code } = $sendOtpPayload;

    return await this.resend.emails.send({
      from: this.fromEmail,
      to: [email],
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <strong>${code}</strong></p>`,
    });
  }
}
