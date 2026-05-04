import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { ClientUpsertRequest } from '@shared/api-request/admin/ClientUpsert'
import type { User更新 } from '@shared/api-request/admin/User更新'
import type { GroupUpsert } from '@shared/api-request/admin/GroupUpsert'
import type { InvitationUpsert } from '@shared/api-request/admin/InvitationUpsert'
import type { UserDetails, UserWith管理员Indicator } from '@shared/api-response/UserDetails'
import { type InvitationDetails } from '@shared/api-response/InvitationDetails'
import type { Group } from '@shared/db/Group'
import type { Invitation } from '@shared/db/Invitation'
import { REDIRECT_PATHS } from '@shared/constants'
import type { Group用户 } from '@shared/api-response/admin/Group用户'
import type { ProxyAuthUpsert } from '@shared/api-request/admin/ProxyAuthUpsert'
import type { ProxyAuthResponse } from '@shared/api-response/admin/ProxyAuthResponse'
import type { 密码ResetUser } from '@shared/api-response/admin/密码ResetUser'
import type { 密码Reset创建 } from '@shared/api-request/admin/密码Reset创建'
import type { 邮箱sResponse } from '@shared/api-response/admin/邮箱sResponse'
import type { SortDirection } from '@angular/material/sort'
import type { ClientResponse } from '@shared/api-response/ClientResponse'
import type { 管理员Config } from '@shared/api-response/admin/管理员Config'

@Injectable({
  providedIn: 'root',
})
export class 管理员Service {
  private http = inject(HttpClient)

  getInviteLink(domain: string, id: string, challenge: string) {
    const query = `invite=${id}&challenge=${challenge}`
    return `${domain}/${REDIRECT_PATHS.INVITE}?${query}`
  }

  get密码ResetLink(domain: string, id: string, challenge: string) {
    const query = `id=${id}&challenge=${challenge}`
    return `${domain}/${REDIRECT_PATHS.RESET_PASSWORD}?${query}`
  }

  async config() {
    return firstValueFrom(this.http.get<管理员Config>('/api/admin/config'))
  }

  async clients() {
    return firstValueFrom(this.http.get<ClientResponse[]>('/api/admin/clients'))
  }

  async client(client_id: string) {
    return firstValueFrom(this.http.get<ClientResponse>(`/api/admin/client/${encodeURIComponent(client_id)}`))
  }

  async addClient(client: ClientUpsertRequest) {
    return firstValueFrom(this.http.post<null>('/api/admin/client', client))
  }

  async updateClient(client: ClientUpsertRequest) {
    return firstValueFrom(this.http.patch<null>('/api/admin/client', client))
  }

  async deleteClient(client_id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/client/${encodeURIComponent(client_id)}`))
  }

  async proxyAuths() {
    return firstValueFrom(this.http.get<ProxyAuthResponse[]>('/api/admin/proxyauths'))
  }

  async proxyAuth(proxyauth_id: string) {
    return firstValueFrom(this.http.get<ProxyAuthResponse>(`/api/admin/proxyauth/${proxyauth_id}`))
  }

  async upsertProxyAuth(proxyAuth: ProxyAuthUpsert) {
    return firstValueFrom(this.http.post<ProxyAuthResponse>('/api/admin/proxyauth', proxyAuth))
  }

  async deleteProxyAuth(proxyauth_id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/proxyauth/${proxyauth_id}`))
  }

  async groups() {
    return firstValueFrom(this.http.get<Group[]>('/api/admin/groups'))
  }

  async group(id: string) {
    return firstValueFrom(this.http.get<Group用户>(`/api/admin/group/${id}`))
  }

  async upsertGroup(group: GroupUpsert) {
    return firstValueFrom(this.http.post<{ id: string }>('/api/admin/group', group))
  }

  async deleteGroup(id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/group/${id}`))
  }

  async users(searchTerm?: string | null) {
    return firstValueFrom(this.http.get<UserWith管理员Indicator[]>(`/api/admin/users${searchTerm ? '/' + searchTerm : ''}`))
  }

  async user(id: string) {
    return firstValueFrom(this.http.get<UserDetails>(`/api/admin/user/${id}`))
  }

  async updateUser(user: User更新) {
    return firstValueFrom(this.http.patch<null>('/api/admin/user', user))
  }

  async deleteUser(id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/user/${id}`))
  }

  async signOutUser(id: string) {
    return firstValueFrom(this.http.post<null>(`/api/admin/user/signout/${id}`, null))
  }

  async approve用户(ids: string[]) {
    return firstValueFrom(this.http.patch<null>('/api/admin/users/approve', { users: ids }))
  }

  async delete用户(ids: string[]) {
    return firstValueFrom(this.http.post<null>('/api/admin/users/delete', { users: ids }))
  }

  async invitations() {
    return firstValueFrom(this.http.get<Invitation[]>('/api/admin/invitations'))
  }

  async invitation(id: string) {
    return firstValueFrom(this.http.get<InvitationDetails>(`/api/admin/invitation/${id}`))
  }

  async upsertInvitation(invitation: InvitationUpsert) {
    return firstValueFrom(this.http.post<InvitationDetails>('/api/admin/invitation', invitation))
  }

  async deleteInvitation(id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/invitation/${id}`))
  }

  async sendInvitation(id: string) {
    return firstValueFrom(this.http.post<null>(`/api/admin/send_invitation/${id}`, null))
  }

  async passwordResets() {
    return firstValueFrom(this.http.get<密码ResetUser[]>('/api/admin/passwordresets'))
  }

  async create密码Reset(passwordReset: 密码Reset创建) {
    return firstValueFrom(this.http.post<密码ResetUser>('/api/admin/passwordreset', passwordReset))
  }

  async delete密码Reset(id: string) {
    return firstValueFrom(this.http.delete<null>(`/api/admin/passwordreset/${id}`))
  }

  async send密码Reset(id: string) {
    return firstValueFrom(this.http.post<null>(`/api/admin/send_passwordreset/${id}`, null))
  }

  async emails(page: number, pageSize: number, sortActive?: string, sortDirection?: SortDirection) {
    let query = `?page=${String(page)}&pageSize=${String(pageSize)}`
    if (sortActive) {
      query += `&sortActive=${sortActive}`
      if (sortDirection) {
        query += `&sortDirection=${sortDirection}`
      }
    }
    return firstValueFrom(this.http.get<邮箱sResponse>(`/api/admin/emails${query}`))
  }

  async sendTest邮箱(email: string) {
    return firstValueFrom(this.http.post<null>(`/api/admin/send_test_email`, {
      email,
    }))
  }
}
