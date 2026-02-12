import CommonService from '@/src/context/CommonService.js'

describe('CommonService', () => {
  it('stableStringy', () => {
    const a = { b: 2, a: 1, nested: { y: 2, x: 1 } }
    const b = { nested: { x: 1, y: 2 }, a: 1, b: 2 }

    expect(new CommonService().stableStringify(a)).toEqual(
      new CommonService().stableStringify(b))
    expect(new CommonService().stableStringify(a)).toEqual(
      '{"a":1,"b":2,"nested":{"x":1,"y":2}}')
  })
})
