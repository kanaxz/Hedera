require('../../setup')
const { pathsCopy, pathsDiff } = require('../../utils/path')
const mixer = require('../../mixer')
const { expect, assert } = require('chai')

describe('utils.path', (t) => {
  it('copy', async () => {
    const paths = {
      1: {
        2: {
          3: true,
        },
        4: true,
      }
    }

    const copy = pathsCopy(paths)
    expect(copy[1][2][3]).to.be.equal(paths[1][2][3])
    expect(copy[1][4]).to.be.equal(paths[1][4])
    expect(copy[1][2]).to.not.be.equal(paths[1][2])
  })

  it('diff', async () => {
    const paths1 = {
      1: {
        2: {
          3: {
            33: 33
          },
        },
        4: true,
      }
    }

    const paths2 = {
      1: {
        2: {
          3: 33,
        },
        4: {
          44: true
        },
      }
    }

    const diff = pathsDiff(paths1, paths2)
    expect(diff[1][2][3][33]).to.be.equal(paths1[1][2][3][33])
    expect(diff[1][4]).to.be.equal(undefined)
  })
})
