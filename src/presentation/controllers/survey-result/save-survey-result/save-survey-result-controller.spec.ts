import { HttpRequest, LoadSurveyById, SurveyModel, forbidden, InvalidParamError } from './save-survey-result-controller-protocols'
import { SaveSurveyResultController } from './save-survey-result-controller'
import { serverError } from '@/presentation/helpers/http/http-helper'

type SutTypes = {
  sut: SaveSurveyResultController
  loadSurveyByIdStub: LoadSurveyById
}

const makeFakeSurvey = (): SurveyModel => ({
  id: 'any_id',
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any'
  }],
  date: new Date()
})

const makeFakeRequest = (): HttpRequest => ({
  params: {
    surveyId: 'any_id'
  },
  body: {
    answer: 'any_answer'
  }
})

const makeLoadSurveyById = (): LoadSurveyById => {
  class LoadSurveyByIdStub implements LoadSurveyById {
    async loadById (): Promise<SurveyModel | null> {
      return Promise.resolve(makeFakeSurvey())
    }
  }
  return new LoadSurveyByIdStub()
}

const makeSut = (): SutTypes => {
  const loadSurveyByIdStub = makeLoadSurveyById()
  return {
    sut: new SaveSurveyResultController(loadSurveyByIdStub),
    loadSurveyByIdStub
  }
}

describe('SaveSurveyResultController', () => {
  test('Should call LoadSurveyById with correct values', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    await sut.handle(makeFakeRequest())
    expect(loadSpy).toHaveBeenCalledWith(makeFakeRequest().params.surveyId)
  })
  test('Should return 403 if LoadSurveyById returns null ', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })
  test('Should return 500 if LoadSurveyById returns throws ', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.reject(new Error()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
  test('Should return 403 if an invalid answer is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: {
        surveyId: 'any_id'
      },
      body: {
        answer: 'wrong_answer'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
  })
})
