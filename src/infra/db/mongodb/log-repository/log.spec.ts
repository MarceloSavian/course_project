import { Collection } from 'mongodb'
import { LogErrorRepository } from '../../../../data/protocols/log-error-repository'
import { mongoHelper } from '../helpers/mongo-helper'
import { LogMongoRepository } from './log'

interface SutInterface {
  sut: LogErrorRepository
}

const makeSut = (): SutInterface => {
  return {
    sut: new LogMongoRepository()
  }
}

describe('Mongo Log Repository', () => {
  let errorCollection: Collection
  beforeAll(async () => {
    await mongoHelper.connect(String(process.env.MONGO_URL))
  })
  afterAll(async () => {
    await mongoHelper.disconnect()
  })
  beforeEach(async () => {
    errorCollection = await mongoHelper.getCollection('errors')
    await errorCollection.deleteMany({})
  })
  test('Should create an log on success', async () => {
    const { sut } = makeSut()
    await sut.logError('test')
    const count = await errorCollection.countDocuments()
    expect(count).toBe(1)
  })
})
