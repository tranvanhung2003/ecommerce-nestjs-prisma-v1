import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import { GetAuthorizationUrlPayload } from './auth.model';

@Injectable()
export class GoogleService {
  private readonly oauth2Client: OAuth2Client;

  constructor() {
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
}
