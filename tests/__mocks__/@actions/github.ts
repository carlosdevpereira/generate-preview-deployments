import pullRequestFixture from '@tests/__fixtures__/pull-request.json'

export const context = {
  payload: {
    pull_request: pullRequestFixture
  }
}

export function getOctokit() {
  return {
    rest: {
      issues: {
        listComments: jest.fn(() => ({ data: [] })),
        createComment: jest.fn(),
        updateComment: jest.fn()
      }
    }
  }
}
