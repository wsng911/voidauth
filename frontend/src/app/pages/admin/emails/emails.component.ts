import { Component, inject, viewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import type { TableColumn } from '../clients/clients.component'
import type { 邮箱Log } from '@shared/db/邮箱Log'
import { 管理员Service } from '../../../services/admin.service'
import { SnackbarService } from '../../../services/snackbar.service'
import { SpinnerService } from '../../../services/spinner.service'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { MaterialModule } from '../../../material-module'
import { RouterLink } from '@angular/router'
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser'
import DOMPurify from 'isomorphic-dompurify'
import { 邮箱InputComponent } from '../../../dialogs/email-input/email-input.component'
import { UserService } from '../../../services/user.service'
import type { CurrentUserDetails } from '@shared/api-response/UserDetails'
import type { ConfigResponse } from '@shared/api-response/ConfigResponse'
import { ConfigService } from '../../../services/config.service'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-emails',
  imports: [
    MaterialModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss',
})
export class 邮箱sComponent {
  dataSource: MatTableDataSource<邮箱Log> = new MatTableDataSource()

  readonly paginator = viewChild.required(MatPaginator)
  readonly sort = viewChild.required(MatSort)

  columns: TableColumn<邮箱Log>[] = [
    {
      columnDef: 'createdAt',
      header: 'Sent',
      cell: element => new Date(element.createdAt).toDateString(),
    },
    {
      columnDef: 'to',
      header: 'To',
      cell: element => element.to,
    },
    {
      columnDef: 'type',
      header: 'Type',
      cell: element => element.type,
    },
  ]

  displayedColumns = ([] as string[]).concat(this.columns.map(c => c.columnDef)).concat(['actions'])

  private adminService = inject(管理员Service)
  private snackbarService = inject(SnackbarService)
  private spinnerService = inject(SpinnerService)
  private dialog = inject(MatDialog)
  private userService = inject(UserService)
  private configService = inject(ConfigService)

  me?: CurrentUserDetails
  public config?: ConfigResponse

  async ngAfterViewInit() {
    // Assign the data to the data source for the table to render
    try {
      this.spinnerService.show()

      this.me = await this.userService.getMyUser()
      this.config = await this.configService.getConfig()
      await this.setData()

      this.paginator().page.subscribe(async () => {
        await this.setData()
      })

      this.sort().sortChange.subscribe(async () => {
        await this.setData()
      })
    } finally {
      this.spinnerService.hide()
    }
  }

  async setData() {
    try {
      this.spinnerService.show()
      const pageIndex = this.paginator().pageIndex
      const pageSize = this.paginator().pageSize
      const sortActive = this.sort().active
      const sortDirection = this.sort().direction
      const data = await this.adminService.emails(pageIndex, pageSize, sortActive, sortDirection)
      this.dataSource.data = data.emails
      this.paginator().length = data.count
    } catch (_e) {
      this.snackbarService.error('Could not get Sent Mail.')
    } finally {
      this.spinnerService.hide()
    }
  }

  sendTest邮箱() {
    const test邮箱Dialog = this.dialog.open<邮箱InputComponent, { message?: string, header?: string, initial?: string }>(
      邮箱InputComponent, {
        data: {
          header: 'Send Test 邮箱',
          initial: this.me?.email,
        },
        disable关闭: true,
      })

    test邮箱Dialog.after关闭d().subscribe(async (data) => {
      if (data && typeof data === 'string') {
        try {
          this.spinnerService.show()
          await this.adminService.sendTest邮箱(data)
          await this.setData()
          this.snackbarService.message('Sent Test 邮箱.')
        } catch (e) {
          console.error(e)
          this.snackbarService.error('Could not send Test 邮箱.')
        } finally {
          this.spinnerService.hide()
        }
      }
    })
  }

  preview邮箱(email: 邮箱Log) {
    this.dialog.open(邮箱PreviewComponent, {
      data: email,
      width: '600px',
      height: 'calc(100% - 16px)',
    })
  }
}

@Component({
  selector: 'app-email-preview',
  imports: [
    MaterialModule,
  ],
  template: `
    <h2 mat-dialog-title><b>{{dialogData.subject}}</b></h2>
    <div class="content">
      <p>To: {{dialogData.to}}</p>
      <div style="flex-grow: 1;">
        <iframe [srcdoc]="body"></iframe>
      </div>
    </div>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">关闭</button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      padding: 0px 16px;
    }

    iframe {
      width: 100%;
      height: calc(100% - 6px);
      border-radius: 16px;
      border: 0px;
    }
  `,
})
class 邮箱PreviewComponent {
  dialogData = inject<邮箱Log>(MAT_DIALOG_DATA)
  sanitizer = inject(DomSanitizer)
  body?: SafeHtml
  constructor() {
    if (this.dialogData.body) {
      this.body = this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(this.dialogData.body))
    }
  }
}
