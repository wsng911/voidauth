import { inject, Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import type { RegisterUser } from '@shared/api-request/RegisterUser'
import type { LoginUser } from '@shared/api-request/LoginUser'
import type { VerifyUser邮箱 } from '@shared/api-request/VerifyUser邮箱'
import type { Redirect } from '@shared/api-response/Redirect'
import type { ConsentDetails } from '@shared/api-response/ConsentDetails'
import type { InvitationDetails } from '@shared/api-response/InvitationDetails'
import type { Send密码ResetResponse } from '@shared/api-response/Send密码ResetResponse'
import type { Reset密码 } from '@shared/api-request/Reset密码'
import { type RegistrationResponseJSON, type PublicKeyCredentialCreationOptionsJSON, WebAuthnError } from '@simplewebauthn/browser'
import type { RegisterTotpResponse } from '@shared/api-response/RegisterTotpResponse'
import type { InteractionInfo } from '@shared/api-response/InteractionInfo'
import { oidcLoginPath } from '@shared/oidc'
import { getCurrentHost } from './config.service'
import type { 密码ResetResponse } from '@shared/api-response/密码ResetResponse'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)

  async getInteractionDetails(uid: string) {
    return firstValueFrom(this.http.get<ConsentDetails>(`/api/interaction/${uid}/detail`))
  }

  async interactionExists() {
    return firstValueFrom(this.http.get<InteractionInfo>('/api/interaction/exists'))
  }

  async createInteraction(defaultRedir: boolean = false) {
    try {
      await firstValueFrom(this.http.get<null>(oidcLoginPath(getCurrentHost(), defaultRedir, 'login'), {
        redirect: 'manual',
      }))
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status > 200 && e.status < 400) {
        return
      }
      console.error(typeof e === 'object' && e && 'error' in e
        && typeof e.error === 'object' && e.error && 'error' in e.error
        ? e.error.error
        : e)
    }
  }

  async cancelInteraction() {
    return firstValueFrom(this.http.delete<null>('/api/interaction/current'))
  }

  async register(body: RegisterUser) {
    return firstValueFrom(this.http.post<Redirect | undefined>('/api/interaction/register', body))
  }

  async startPasskeySignup(inviteId?: string, challenge?: string) {
    return firstValueFrom(this.http.post<PublicKeyCredentialCreationOptionsJSON>('/api/interaction/register/passkey/start', {
      inviteId,
      challenge,
    }))
  }

  async endPasskeySignup(body: RegistrationResponseJSON & Omit<RegisterUser, 'password'>) {
    try {
      const result = await firstValueFrom(this.http.post<Redirect | undefined>('/api/interaction/register/passkey/end', body))
      localStorage.setItem('passkey_seen', 'true')
      return result
    } catch (error) {
      if (error instanceof WebAuthnError && error.name === 'InvalidStateError') {
        localStorage.setItem('passkey_seen', 'true')
      }
      throw error
    }
  }

  async login(body: LoginUser) {
    return firstValueFrom(this.http.post<Redirect | undefined>('/api/interaction/login', body))
  }

  async consent(uid: string) {
    return firstValueFrom(this.http.post<null>(`/api/interaction/${uid}/confirm`, null))
  }

  async verify邮箱(body: VerifyUser邮箱) {
    return firstValueFrom(this.http.post<Redirect | undefined>('/api/interaction/verify_email', body))
  }

  async send邮箱Verification(body: { id: string }) {
    return firstValueFrom(this.http.post<null>('/api/auth/send_verify_email', body))
  }

  async getInviteDetails(id: string, challenge: string) {
    return firstValueFrom(this.http.get<InvitationDetails>(`/api/auth/invitation/${id}/${challenge}`))
  }

  async send密码Reset(input: string) {
    return firstValueFrom(this.http.post<Send密码ResetResponse>('/api/public/send_password_reset', { input }))
  }

  async reset密码(body: Reset密码) {
    return firstValueFrom(this.http.post<密码ResetResponse>('/api/public/reset_password', body))
  }

  async reset密码PasskeyStart(body: Omit<Reset密码, 'new密码'>) {
    return firstValueFrom(this.http.post<PublicKeyCredentialCreationOptionsJSON>('/api/public/reset_password/passkey/start', body))
  }

  async reset密码PasskeyEnd(body: Omit<Reset密码, 'new密码'> & RegistrationResponseJSON) {
    try {
      const result = await firstValueFrom(this.http.post<密码ResetResponse>('/api/public/reset_password/passkey/end', body))
      localStorage.setItem('passkey_seen', 'true')
      return result
    } catch (error) {
      if (error instanceof WebAuthnError && error.name === 'InvalidStateError') {
        localStorage.setItem('passkey_seen', 'true')
      }
      throw error
    }
  }

  async registerTotp() {
    return firstValueFrom(this.http.post<RegisterTotpResponse>('/api/interaction/totp/registration', null))
  }

  async verifyTotp(token: string, enableMfa: boolean) {
    return firstValueFrom(this.http.post<Redirect | undefined>('/api/interaction/totp', { token, enableMfa }))
  }
}
