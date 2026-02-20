import CommonService from '@/src/context/CommonService.js'

describe('CommonService', () => {
  it('stableStringy', () => {
    const a = { b: 2, a: 1, nested: { y: 2, x: 1 } }
    const b = { nested: { x: 1, y: 2 }, a: 1, b: 2 }

    expect(new CommonService(null, null).stableStringify(a)).toEqual(
      new CommonService(null, null).stableStringify(b))
    expect(new CommonService(null, null).stableStringify(a)).toEqual(
      '{"a":1,"b":2,"nested":{"x":1,"y":2}}')
  })

  it('hash', async () => {
    const hash = await new CommonService(null, null).hash('test string')
    expect(hash).toEqual('661295c9cbf9d6b2f6428414504a8deed3020641')
  })
})
