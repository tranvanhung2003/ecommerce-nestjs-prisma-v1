import { Injectable } from '@nestjs/common';
import { pretty, render } from '@react-email/render';
import OtpEmail from 'emails/otp';
import React from 'react';
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
  private readonly subject = 'Mã OTP';

  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
    this.fromEmail = `Ecommerce <noreply@${envConfig.RESEND_DOMAIN_NAME}>`;
  }

  async sendOtp(sendOtpPayload: SendOtpPayload) {
    const $sendOtpPayload = SendOtpSchema.parse(sendOtpPayload);

    const { email, code } = $sendOtpPayload;

    const html = await pretty(
      await render(<OtpEmail title={this.subject} code={code} />),
    );

    return await this.resend.emails.send({
      from: this.fromEmail,
      to: [email],
      subject: this.subject,
      html,
    });
  }
}
