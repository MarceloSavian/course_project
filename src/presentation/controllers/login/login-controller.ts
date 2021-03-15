import { Authentication, Controller, HttpRequest, HttpResponse } from './login-controller-protocols'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http/http-helper'
import { Validation } from '../../protocols/validation'

export class LoginController implements Controller {
  private readonly validation: Validation
  private readonly authentication: Authentication

  constructor (authentication: Authentication, validation: Validation) {
    this.authentication = authentication
    this.validation = validation
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)

      if (error) {
        return badRequest(error)
      }

      const { email, password } = httpRequest.body

      const token = await this.authentication.auth({ email, password })

      if (!token) {
        return unauthorized()
      }

      return ok({
        accessToken: token
      })
    } catch (error) {
      return serverError(error)
    }
  }
}