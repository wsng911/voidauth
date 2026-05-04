import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import type { 更新个人资料 } from '@shared/api-request/更新个人资料'
import type { 更新邮箱 } from '@shared/api-request/更新邮箱'
import type { 更新密码 } from '@shared/api-request/更新密码'
import { firstValueFrom } from 'rxjs'
import type { CurrentUserDetails, CurrentUserPrivateDetails } from '@shared/api-response/UserDetails'
import type { PasskeyResponse } from '@shared/api-response/PasskeyResponse'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient)

  private me?: Promise<CurrentUserDetails>
  private privMe?: Promise<CurrentUserPrivateDetails>

  async getMyUser(options?: {
    disableCache?: boolean
  }) {
    if (!this.me || !!options?.disableCache) {
      this.me = firstValueFrom(this.http.get<CurrentUserDetails>(`/api/user/me`))
    }

    return this.me
  }

  async getMyPrivateUser(options?: {
    disableCache?: boolean
  }) {
    if (!this.privMe || !!options?.disableCache) {
      this.privMe = firstValueFrom(this.http.get<CurrentUserPrivateDetails>(`/api/user/me/private`))
    }

    return this.privMe
  }

  isPasskeySession(user: Pick<CurrentUserDetails, 'amr'>) {
    return user.amr.includes('webauthn')
  }

  async update个人资料(profile: 更新个人资料) {
    return firstValueFrom(this.http.patch<null>('/api/user/profile', profile))
  }

  async send邮箱Verification() {
    return firstValueFrom(this.http.post<null>('/api/user/send_verify_email', {}))
  }

  async update邮箱(email更新: 更新邮箱) {
    return firstValueFrom(this.http.patch<{ sentVerification: boolean }>('/api/user/email', email更新))
  }

  async passwordStrength(password: string) {
    return firstValueFrom(this.http.post<{ score: 0 | 1 | 2 | 3 | 4 }>('/api/public/passwordStrength', { password }))
  }

  async update密码(password更新: 更新密码) {
    return firstValueFrom(this.http.patch<null>('/api/user/password', password更新))
  }

  async getPasskeys() {
    return firstValueFrom(this.http.get<PasskeyResponse[]>('/api/user/passkeys'))
  }

  async removePasskey(passkey_id: string) {
    return firstValueFrom(this.http.delete<null[]>(`/api/user/passkey/${passkey_id}`))
  }

  async removeAllPasskeys() {
    return firstValueFrom(this.http.delete<null>('/api/user/passkeys'))
  }

  async remove密码() {
    return firstValueFrom(this.http.delete<null>('/api/user/password'))
  }

  async removeAllAuthenticators() {
    return firstValueFrom(this.http.delete<null>('/api/user/totp'))
  }

  async deleteUser() {
    return firstValueFrom(this.http.delete<null>('/api/user/user'))
  }
}
