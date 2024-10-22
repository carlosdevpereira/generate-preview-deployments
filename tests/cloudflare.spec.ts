import CloudflareClient from '@/cloudflare'
import cloudflareDeploymentResponseFixture from '@tests/__fixtures__/cloudflare-deployment-response.json'
import axios from 'axios'

describe('src/cloudflare.ts', () => {
  it('exports a valid Cloudflare client class', () => {
    expect(CloudflareClient).toBeDefined()
    expect(CloudflareClient).toBeInstanceOf(Function)

    const client = new CloudflareClient('account-id', 'api-token')

    expect(client).toBeInstanceOf(CloudflareClient)
    expect(client.deploy).toBeInstanceOf(Function)
  })

  describe('when called with all required inputs', () => {
    it('performs the deploy request and returns the response', async () => {
      jest.spyOn(Date.prototype, 'toISOString').mockImplementationOnce(() => {
        return '2020-01-01T00:00:00.000Z'
      })

      jest.spyOn(axios, 'postForm').mockImplementationOnce(async () => {
        return {
          data: {
            result: cloudflareDeploymentResponseFixture
          }
        }
      })

      const client = new CloudflareClient('account-id', 'api-token')
      const response = await client.deploy('project-name', 'branch')

      expect(response).toEqual(cloudflareDeploymentResponseFixture)
    })

    it('retries the deploy request if it fails', async () => {
      jest.spyOn(Date.prototype, 'toISOString').mockImplementationOnce(() => {
        return '2020-01-01T00:00:00.000Z'
      })

      jest
        .spyOn(axios, 'postForm')
        .mockRejectedValueOnce(new Error('Request failed'))
        .mockImplementationOnce(async () => {
          return {
            data: {
              result: cloudflareDeploymentResponseFixture
            }
          }
        })

      const client = new CloudflareClient('account-id', 'api-token')
      const response = await client.deploy('project-name', 'branch')

      expect(response).toEqual(cloudflareDeploymentResponseFixture)
    })
  })

  it('throws missing account id error when account id is not provided', () => {
    expect(() => new CloudflareClient('', 'api-token')).toThrow(
      'Missing Cloudflare account ID'
    )
  })

  it('throws missing api token error when api token is not provided', () => {
    expect(() => new CloudflareClient('account-id', '')).toThrow(
      'Missing Cloudflare API token'
    )
  })

  it('throws missing project name error when project name is not provided', () => {
    expect(() =>
      new CloudflareClient('account-id', 'api-token').deploy('', 'branch')
    ).rejects.toThrow('Missing Cloudflare Pages project name')
  })
})
