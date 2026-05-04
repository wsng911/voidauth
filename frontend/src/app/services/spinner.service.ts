import { inject, Injectable } from '@angular/core'
import { NgxSpinnerService } from 'ngx-spinner'

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private ngxSpinnerService = inject(NgxSpinnerService)

  private count = 0

  show() {
    this.count++
    this.check状态()
  }

  hide() {
    setTimeout(() => {
      this.count--
      this.check状态()
    }, 500)
  }

  private check状态() {
    if (this.count > 0) {
      void this.ngxSpinnerService.show()
    } else {
      void this.ngxSpinnerService.hide()
    }
  }
}
