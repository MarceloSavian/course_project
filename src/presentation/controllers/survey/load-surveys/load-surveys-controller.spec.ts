import { LoadSurveysController } from './load-surveys-controller'
import { LoadSurvey, SurveyModel } from './load-surveys-controller-protocols'
import MockDate from 'mockdate'
import { ok, serverError } from '../../../helpers/http/http-helper'

interface SutInterface {
  sut: LoadSurveysController
  loadSurveyStub: LoadSurvey
}

const makeFakeSurvey = (): SurveyModel[] => ([{
  id: 'any_id',
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any'
  }],
  date: new Date()
}])

const makeLoadSurvey = (): LoadSurvey => {
  class LoadSurveyStub implements LoadSurvey {
    async load (): Promise<SurveyModel[]> {
      return Promise.resolve(makeFakeSurvey())
    }
  }
  return new LoadSurveyStub()
}

const makeSut = (): SutInterface => {
  const loadSurveyStub = makeLoadSurvey()
  return {
    sut: new LoadSurveysController(loadSurveyStub),
    loadSurveyStub
  }
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })
  afterAll(() => {
    MockDate.reset()
  })
  test('Should call LoadSurveys', async () => {
    const { sut, loadSurveyStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveyStub, 'load')
    await sut.handle()
    expect(loadSpy).toHaveBeenCalled()
  })
  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httResponse = await sut.handle()
    expect(httResponse).toEqual(ok(makeFakeSurvey()))
  })
  test('Should return 500 id LoadSurvey throws', async () => {
    const { sut, loadSurveyStub } = makeSut()
    jest.spyOn(loadSurveyStub, 'load').mockReturnValueOnce(Promise.reject(new Error()))
    const httResponse = await sut.handle()
    expect(httResponse).toEqual(serverError(new Error()))
  })
})