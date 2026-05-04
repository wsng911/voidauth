import { Component, input } from '@angular/core'
import { ReactiveFormsModule, FormControl } from '@angular/forms'
import { MaterialModule } from '../../material-module'
import { ValidationErrorPipe } from '../../pipes/ValidationErrorPipe'
import { 新建密码InputComponent } from '../new-password-input/new-password-input.component'
import { AsyncPipe } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-password-set',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    ValidationErrorPipe,
    新建密码InputComponent,
    AsyncPipe,
    TranslatePipe,
  ],
  templateUrl: './password-set.component.html',
  styleUrl: './password-set.component.scss',
})
export class 密码SetComponent {
  old密码 = input<FormControl<string | null>>()
  new密码 = input.required<FormControl<string | null>>()
  confirm密码 = input.required<FormControl<string | null>>()

  pwdShow: boolean = false
}
