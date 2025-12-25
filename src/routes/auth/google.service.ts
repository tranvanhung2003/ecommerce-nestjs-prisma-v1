import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import {
  GetAuthorizationUrlPayload,
  GoogleAuthStatePayload,
  GoogleCallbackPayload,
  User$RolePayload,
} from './auth.model';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleService {
  private readonly oauth2Client: OAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      redirectUri: envConfig.GOOGLE_REDIRECT_URI,
    });
  }

  getAuthorizationUrl(getAuthorizationUrlPayload: GetAuthorizationUrlPayload) {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    // Chuyển Object thành base64 để tránh lỗi ký tự đặc biệt trong URL
    const state = Buffer.from(
      JSON.stringify(getAuthorizationUrlPayload),
    ).toString('base64');

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state,
    });

    return { url };
  }

  async googleCallback(googleCallbackPayload: GoogleCallbackPayload) {
    try {
      const { code, state } = googleCallbackPayload;

      // Lấy state từ URL, nếu thất bại thì gán userAgent và ip là 'Unknown'
      let parsedState: GoogleAuthStatePayload = {
        userAgent: 'Unknown',
        ip: 'Unknown',
      };

      try {
        const decodedState = Buffer.from(state, 'base64').toString();
        parsedState = JSON.parse(decodedState) as GoogleAuthStatePayload;
      } catch {
        // Ignore error
      }

      // Lấy token từ code
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Lấy thông tin user từ Google
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });

      const { data: userInfo } = await oauth2.userinfo.get();

      // Kiểm tra thông tin email
      if (!userInfo.email || !userInfo.verified_email) {
        throw new Error('Không thể lấy thông tin người dùng từ Google');
      }

      // Kiểm tra user trong database
      let user: User$RolePayload | null =
        await this.authRepository.findUniqueUser$Role({
          email: userInfo.email,
        });

      // Nếu không có user thì đây là người dùng mới, tiến hành tạo user mới
      if (!user) {
      }
    } catch (error) {}
  }
}
