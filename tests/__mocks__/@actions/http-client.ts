import cloudflareDeploymentResponseFixture from '@tests/__fixtures__/cloudflare-deployment-response.json'

export const HttpClient = jest.fn(() => {
  return {
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
})
