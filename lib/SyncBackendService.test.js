import SyncBackendService from './SyncBackendService.js'

describe('SyncBackendService', () => {
  const service = new SyncBackendService(':memory:')

  beforeEach(async () => {
    await service.open({ runMigration: true })
  })

  afterEach(async () => {
    await service.close()
  })

  it('add user details', async () => {
    await service.synchronizeUserDetails('user001', [{ movieId: 100, mark: 5 }])
    const userDetails = await service.allUserData('user001', 'details')
    expect(userDetails).toHaveLength(1)
    expect(userDetails[0]).toMatchObject({
      movieId: 100,
      mark: 5,
      version: 1
    })
    expect(await service.allUserData('user002', 'details')).toHaveLength(0)
  })

  it('update user details', async () => {
    await service.synchronizeUserDetails('user001', [{ movieId: 100, mark: 5, other: 'test' }])
    await service.synchronizeUserDetails('user001', [{ movieId: 100, mark: 2 }])
    const userDetails = await service.allUserData('user001', 'details')
    expect(userDetails).toHaveLength(1)
    expect(userDetails[0]).toMatchObject({
      movieId: 100,
      mark: 2,
      version: 2
    })
  })

  it('savePush', async () => {
    const pushId = await service.savePush({
      endpoint: '123',
      keys: { auth: 'abc', p256dh: 'xyz' }
    })
    expect(Number.isInteger(pushId)).toBe(true)
  })

  it('savePush', async () => {
    const pushId = await service.savePush({
      endpoint: '123',
      keys: { auth: 'abc', p256dh: 'xyz' }
    })
    expect(Number.isInteger(pushId)).toBe(true)
  })
})
