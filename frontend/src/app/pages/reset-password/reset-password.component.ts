import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MaterialModule } from '../../material-module'
import { AuthService } from '../../services/auth.service'
import { SnackbarService } from '../../services/snackbar.service'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { 密码SetComponent } from '../../components/password-reset/password-set.component'
import { REDIRECT_PATHS } from '@shared/constants'
import { HttpErrorResponse } from '@angular/common/http'
import { SpinnerService } from '../../services/spinner.service'
import { ConfigService } from '../../services/config.service'
import type { ConfigResponse } from '@shared/api-response/ConfigResponse'
import { TextDividerComponent } from '../../components/text-divider/text-divider.component'
import { PasskeyService, type PasskeySupport } from '../../services/passkey.service'
import { startRegistration, WebAuthnError } from '@simplewebauthn/browser'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-reset-password',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    密码SetComponent,
    TextDividerComponent,
    TranslatePipe,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class Reset密码Component {
  userid?: string
  challenge?: string
  config?: ConfigResponse
  passkeySupport?: PasskeySupport

  public passwordForm = new FormGroup({
    new密码: new FormControl<string>({
      value: '',
      disabled: false,
    }, [Validators.required]),
    confirm密码: new FormControl<string>({
      value: '',
      disabled: false,
    }, [Validators.required]),
  }, {
    validators: (g) => {
      const passAreEqual = g.get('new密码')?.value === g.get('confirm密码')?.value
      if (!passAreEqual) {
        g.get('confirm密码')?.setErrors({ notEqual: 'Must equal 密码' })
        return { notEqual: '密码s do not match' }
      }
      g.get('confirm密码')?.setErrors(null)
      return null
    },
  })

  private activatedRoute = inject(ActivatedRoute)
  private authService = inject(AuthService)
  private snackbarService = inject(SnackbarService)
  private router = inject(Router)
  private spinnerService = inject(SpinnerService)
  private configService = inject(ConfigService)
  passkeyService = inject(PasskeyService)

  async ngOnInit() {
    const params = this.activatedRoute.snapshot.queryParamMap

    const id = params.get('id')
    const challenge = params.get('challenge')

    if (!id || !challenge) {
      this.snackbarService.error('Invalid 密码 Reset Link.')
      return
    }

    this.userid = id
    this.challenge = challenge

    try {
      this.spinnerService.show()
      this.config = await this.configService.getConfig()
      this.passkeySupport = await this.passkeyService.getPasskeySupport()
    } finally {
      this.spinnerService.hide()
    }
  }

  async send() {
    try {
      if (!this.userid || !this.challenge || !this.passwordForm.controls.new密码.value) {
        throw new Error('Missing required parameters for submit.')
      }

      this.spinnerService.show()

      const { username } = await this.authService.reset密码({
        userId: this.userid,
        challenge: this.challenge,
        new密码: this.passwordForm.controls.new密码.value,
      })
      this.snackbarService.message('密码 Reset Complete.')
      await this.router.navigate([REDIRECT_PATHS.LOGIN], {
        queryParams: {
          username,
        },
      })
    } catch (e) {
      console.error(e)

      let shownError: string | null = null
      if (e instanceof HttpErrorResponse) {
        shownError ??= e.error?.message
      } else {
        shownError ??= (e as Error).message
      }

      shownError ??= 'Something went wrong.'
      this.snackbarService.error(shownError)
    } finally {
      this.spinnerService.hide()
    }
  }

  async registerPasskey() {
    this.spinnerService.show()
    try {
      const userId = this.userid
      const challenge = this.challenge
      if (!userId || !challenge) {
        throw new Error('Missing required parameters for submit.')
      }
      const optionsJSON = await this.authService.reset密码PasskeyStart({ userId, challenge })
      const registration = await startRegistration({ optionsJSON })
      const { username } = await this.authService.reset密码PasskeyEnd({ ...registration, userId, challenge })
      this.snackbarService.message('Passkey created.')
      await this.router.navigate([REDIRECT_PATHS.LOGIN], {
        queryParams: {
          username,
        },
      })
    } catch (error) {
      if (error instanceof WebAuthnError && error.name === 'InvalidStateError') {
        this.snackbarService.error('Passkey already registered.')
      } else {
        this.snackbarService.error('Could not register passkey.')
      }
      console.error(error)
    } finally {
      this.spinnerService.hide()
    }
  }
}
