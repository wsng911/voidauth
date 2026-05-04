import { Component, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MaterialModule } from '../../material-module'
import { ValidationErrorPipe } from '../../pipes/ValidationErrorPipe'

@Component({
  selector: 'app-passkey-edit',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    ValidationErrorPipe,
  ],
  templateUrl: './passkey-edit.component.html',
  styleUrl: './passkey-edit.component.scss',
})
export class Passkey编辑Dialog {
  readonly dialogRef = inject(MatDialogRef<Passkey编辑Dialog>)
  readonly data = inject<{ id: string, display名称: string | null }>(MAT_DIALOG_DATA)
  display名称Control = new FormControl<string | null>(this.data.display名称 ?? null, [Validators.minLength(1)])
}
