import { Component, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { MaterialModule } from '../../material-module'
import { ValidationErrorPipe } from '../../pipes/ValidationErrorPipe'
import { TranslatePipe } from '@ngx-translate/core'
import { UAParser } from 'ua-parser-js'
import { PasskeyService } from '../../services/passkey.service'

@Component({
  selector: 'app-passkey-name',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    ValidationErrorPipe,
    TranslatePipe,
  ],
  templateUrl: './passkey-name.component.html',
  styleUrls: ['./passkey-name.component.scss'],
})
export class Passkey名称Dialog {
  readonly dialogRef = inject(MatDialogRef<Passkey名称Dialog>)

  display名称Control = new FormControl<string | null>(
    Passkey名称Dialog.getSuggested(),
    [Validators.minLength(1), Validators.maxLength(64)],
  )

  private static getSuggested(): string | null {
    try {
      const res = UAParser(navigator.userAgent)
      const os = res.os.name ?? ''

      const passkeyPlatform名称 = PasskeyService.getPlatform(os)?.platform名称 ?? ''

      const label = [os, passkeyPlatform名称].filter(l => !!l).join(' - ')

      const suggested = label || null
      return (suggested && suggested.length > 64) ? suggested.slice(0, 61) + '...' : suggested
    } catch (_e) {
      return null
    }
  }
}
