require('../setup')
const mixer = require('../mixer')
const { expect, assert } = require('chai')

describe('base', (t) => {

  it('hasMixin', async () => {
    const M1 = mixer.mixin((base) => class extends base { })
    const M2 = mixer.mixin([M1], (base) => class extends base { })
    const M3 = mixer.mixin([M1], (base) => class extends base { })
    class C1 extends mixer.extends(class { }, [M3, M2]) {

    }
    expect(M2.hasMixin(M1)).to.be.equal(true)
    expect(C1.hasMixin(M1)).to.be.equal(true)
  })
})

