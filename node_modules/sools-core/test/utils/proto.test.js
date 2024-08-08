require('../../setup')
const { getCommonAncestor } = require('../../utils/proto')
const { expect, assert } = require('chai')

describe('utils.proto', (t) => {
  it('getCommonAncestor', async () => {
    class A { }
    class B { }
    class AA extends A { }
    class AB extends A { }
    class AAA extends AA { }
    class AAB extends AA { }
    expect(getCommonAncestor(AAA, AB)).to.be.equal(A)
    expect(getCommonAncestor(AAA, AAB)).to.be.equal(AA)
    expect(getCommonAncestor(A, B, AA)).to.be.equal(Object)
    expect(getCommonAncestor(AA, AAA, B)).to.be.equal(Object)
  })

})
