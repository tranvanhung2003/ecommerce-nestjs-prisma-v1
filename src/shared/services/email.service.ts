import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import z from 'zod';
import envConfig from '../config';
import { compileHtmlTemplate } from '../helpers/helpers';

const SendOtpSchema = z.object({
  email: z.email(),
  code: z.string(),
});

type SendOtpPayload = z.infer<typeof SendOtpSchema>;

@Injectable()
export class EmailService {
  private readonly subjectOtp = 'Mã OTP';
  private readonly otpTemplatePath = path.resolve(
    'src',
    'shared',
    'email-templates',
    'otp.html',
  );

  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly otpTemplate: string;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
    this.fromEmail = `Ecommerce <noreply@${envConfig.RESEND_DOMAIN_NAME}>`;
    this.otpTemplate = fs.readFileSync(this.otpTemplatePath, 'utf8');
  }

  async sendOtp(sendOtpPayload: SendOtpPayload) {
    const $sendOtpPayload = SendOtpSchema.parse(sendOtpPayload);

    const { email, code } = $sendOtpPayload;

    const compiledHtml = compileHtmlTemplate(this.otpTemplate, {
      subject: this.subjectOtp,
      code,
    });

    return await this.resend.emails.send({
      from: this.fromEmail,
      to: [email],
      subject: this.subjectOtp,
      html: compiledHtml,
    });
  }
}
