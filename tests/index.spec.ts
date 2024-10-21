import mockedPullRequestFixture from '@tests/__fixtures__/pull-request.json'

const githubMocks = {
  listComments: jest.fn(async () => ({
    data: [] as { body: string; id: number }[]
  })),
  createComment: jest.fn(),
  updateComment: jest.fn()
}
const mockedClient = {
  post: jest.fn(async () => {
    return {
      readBody: jest.fn(async () => {
        return JSON.stringify({
          result: cloudflareDeploymentResponseFixture,
          success: true,
          errors: [],
          messages: []
        })
      })
    }
  })
}

jest.mock('@actions/http-client', () => ({
  HttpClient: jest.fn(() => mockedClient)
}))

jest.mock('@actions/github', () => ({
  context: {
    payload: {
      pull_request: mockedPullRequestFixture
    }
  },
  getOctokit: jest.fn(() => {
    return {
      rest: {
        issues: {
          listComments: githubMocks.listComments,
          createComment: githubMocks.createComment,
          updateComment: githubMocks.updateComment
        }
      }
    }
  })
}))

import cloudflareDeploymentResponseFixture from '@tests/__fixtures__/cloudflare-deployment-response.json'
import * as core from '@actions/core'
import { getInput as getInputFnMock } from '@tests/__mocks__/@actions/core'
import { COMMENT_FOOTER } from '@/comment'
import { run } from '@/index'

describe('src/index.ts', () => {
  it('exports run function', () => {
    expect(run).toBeDefined()
    expect(run).toBeInstanceOf(Function)
  })

  describe('when comment is not present', () => {
    afterAll(() => {
      mockedClient.post.mockClear()
      githubMocks.createComment.mockClear()
    })

    it('deploys and creates a new comment', async () => {
      await run()

      expect(mockedClient.post).toHaveBeenCalledTimes(2)
      expect(mockedClient.post).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/pages/projects/project1/deployments',
        expect.stringContaining(
          'Content-Disposition: form-data; name="branch"\r\n\r\nbranch1'
        ),
        expect.objectContaining({
          Authorization: 'Bearer cloudflare-api-token'
        })
      )
      expect(githubMocks.createComment).toHaveBeenCalledTimes(1)
    })
  })

  describe('when comment is already present', () => {
    afterAll(() => {
      mockedClient.post.mockClear()
      githubMocks.createComment.mockClear()
    })

    it('deploys and updates existing comment', async () => {
      githubMocks.listComments.mockImplementation(async () => {
        console.log('got inside the mocked list comments')
        return {
          data: [{ id: 1, body: `comment body\n${COMMENT_FOOTER}` }]
        }
      })

      await run()

      expect(mockedClient.post).toHaveBeenCalledTimes(2)
      expect(mockedClient.post).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/cloudflare-account-id/pages/projects/project1/deployments',
        expect.stringContaining(
          'Content-Disposition: form-data; name="branch"\r\n\r\nbranch1'
        ),
        expect.objectContaining({
          Authorization: 'Bearer cloudflare-api-token'
        })
      )
      expect(githubMocks.updateComment).toHaveBeenCalledTimes(1)
    })
  })

  describe('when there are no projects to deploy', () => {
    beforeEach(() => {
      jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
        if (name === 'project-label-mapping') return '[]'
        return 'valid-input-value'
      })
    })

    afterEach(() => {
      jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
    })

    it('does not deploy and does not create a comment', async () => {
      await run()

      expect(mockedClient.post).not.toHaveBeenCalled()
      expect(githubMocks.createComment).not.toHaveBeenCalled()
      expect(githubMocks.updateComment).not.toHaveBeenCalled()
    })
  })
})
