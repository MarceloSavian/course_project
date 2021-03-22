import { Collection } from 'mongodb'
import { mongoHelper } from '../helpers/mongo-helper'
import { SurveyMongoRepository } from './survey-mongo-repository'
import MockDate from 'mockdate'
import { AddSurveyParams } from '@/domain/usecases/survey/add-survey'
import { SurveyModel } from '@/domain/models/survey'

type SutTypes = {
  sut: SurveyMongoRepository
}
const mockFakeSurvey = (): AddSurveyParams => ({
  question: 'any_question',
  answers: [
    {
      image: 'any_image',
      answer: 'any_answer'
    },
    {
      answer: 'any_answer'
    }
  ],
  date: new Date()
})

const mockFakeSurveyWithId = (id: string): SurveyModel => ({
  id,
  ...mockFakeSurvey()
})

const mockSut = (): SutTypes => {
  return {
    sut: new SurveyMongoRepository()
  }
}

describe('Account Mongo Repository', () => {
  let surveyCollection: Collection
  beforeAll(() => {
    MockDate.set(new Date())
  })
  afterAll(() => {
    MockDate.reset()
  })
  beforeAll(async () => {
    await mongoHelper.connect(String(process.env.MONGO_URL))
  })
  afterAll(async () => {
    await mongoHelper.disconnect()
  })
  beforeEach(async () => {
    surveyCollection = await mongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
  })
  describe('add()', () => {
    test('Should insert Survey on success', async () => {
      const { sut } = mockSut()
      await sut.add(mockFakeSurvey())
      const survey = await surveyCollection.findOne({ question: 'any_question' })
      expect(survey).toBeTruthy()
    })
  })
  describe('loadAll()', () => {
    test('Should load all Surveys on success', async () => {
      const { sut } = mockSut()
      await surveyCollection.insertMany([
        mockFakeSurvey(),
        mockFakeSurvey()
      ])
      const surveys = await sut.loadAll()
      expect(surveys.length).toBe(2)
      expect(surveys[0].id).toBeTruthy()
      expect(surveys[0].question).toBe('any_question')
      expect(surveys[1].question).toBe('any_question')
    })
    test('Should load empty list', async () => {
      const { sut } = mockSut()
      const surveys = await sut.loadAll()
      expect(surveys.length).toBe(0)
    })
  })
  describe('loadById()', () => {
    test('Should load a Survey by id on success', async () => {
      const { sut } = mockSut()
      const result = await surveyCollection.insertOne(mockFakeSurvey())
      const id = result.ops[0]?._id
      const survey = await sut.loadById(id)
      expect(survey).toEqual(mockFakeSurveyWithId(id))
    })
  })
})
