import cloudflareDeploymentResponseFixture from '@tests/__fixtures__/cloudflare-deployment-response.json'

export default {
  get: jest.fn(async () => {
    return {
      data: {
        result: [cloudflareDeploymentResponseFixture]
      }
    }
  }),
  post: jest.fn(),
  create: jest.fn(),
  postForm: jest.fn(async () => {
    return {
      data: {
        result: cloudflareDeploymentResponseFixture
      }
    }
  }),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}
