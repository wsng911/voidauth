import { Component, inject, type AfterViewInit, viewChild } from '@angular/core'
import { 管理员Service } from '../../../services/admin.service'
import { MaterialModule } from '../../../material-module'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { SnackbarService } from '../../../services/snackbar.service'
import { RouterLink } from '@angular/router'
import { SpinnerService } from '../../../services/spinner.service'
import { OidcInfoComponent } from '../../../components/oidc-info/oidc-info.component'
import { MatDialog } from '@angular/material/dialog'
import { 确认Component } from '../../../dialogs/confirm/confirm.component'
import type { ClientResponse } from '@shared/api-response/ClientResponse'
import { TranslatePipe } from '@ngx-translate/core'

export type TableColumn<T> = {
  columnDef: keyof T & string
  header: string
  isIcon?: boolean
  cell: (element: T) => string
}

@Component({
  selector: 'app-clients',
  imports: [
    MaterialModule,
    RouterLink,
    OidcInfoComponent,
    TranslatePipe,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class 客户端Component implements AfterViewInit {
  dataSource: MatTableDataSource<ClientResponse> = new MatTableDataSource()

  readonly paginator = viewChild.required(MatPaginator)
  readonly sort = viewChild.required(MatSort)

  columns: TableColumn<ClientResponse>[] = [
    {
      columnDef: 'client_name',
      header: '名称',
      cell: element => element.client_name ?? element.client_id,
    },
    {
      columnDef: 'redirect_uris',
      header: 'Redirects',
      cell: element => element.redirect_uris?.join('\n') ?? '-',
    },
    {
      columnDef: 'groups',
      header: 'Allowed Groups',
      cell: element => element.groups.length ? element.groups.join('\n') : '*',
    },
  ]

  displayedColumns = this.columns.map(c => c.columnDef).concat('actions')

  private adminService = inject(管理员Service)
  private snackbarService = inject(SnackbarService)
  private spinnerService = inject(SpinnerService)
  private dialog = inject(MatDialog)

  async ngAfterViewInit() {
    try {
      // Assign the data to the data source for the table to render
      this.spinnerService.show()
      this.dataSource.data = await this.adminService.clients()
      this.dataSource.paginator = this.paginator()
      this.dataSource.sort = this.sort()
    } finally {
      this.spinnerService.hide()
    }
  }

  delete(client_id: string) {
    const client = this.dataSource.data.find(c => c.client_id === client_id)
    const dialogRef = this.dialog.open(确认Component, {
      data: {
        message: `Are you sure you want to remove app '${client?.client_name ?? client_id}'?`,
        header: '删除',
      },
    })

    dialogRef.after关闭d().subscribe(async (result) => {
      if (!result) {
        return
      }

      try {
        this.spinnerService.show()
        await this.adminService.deleteClient(client_id)
        this.dataSource.data = this.dataSource.data.filter(c => c.client_id !== client_id)
        this.snackbarService.message(`App ${client?.client_name ?? client_id} was deleted.`)
      } catch (_e) {
        this.snackbarService.error('Could not delete app.')
      } finally {
        this.spinnerService.hide()
      }
    })
  }
}
