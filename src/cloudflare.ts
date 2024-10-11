import type { CloudflareResponse } from './types'

import { HttpClient } from '@actions/http-client'

export default class Cloudflare {
  private readonly accountID: string
  private readonly apiToken: string

  constructor(accountID: string, apiToken: string) {
    this.accountID = accountID
    this.apiToken = apiToken
  }

  /**
   * Generate a Cloudflare preview deployment for the given project and branch.
   * @param projectName The name of the Cloudflare Pages project.
   * @param branch The branch to create a preview for.
   * @returns The response from the Cloudflare API.
   */
  async deploy(projectName: string, branch: string) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/pages/projects/${projectName}/deployments`
    const body = `-----011000010111000001101001\r\nContent-Disposition: form-data; name="branch"\r\n\r\n${branch}\r\n-----011000010111000001101001--\r\n\r\n`
    const headers = {
      'Cache-Control': 'no-store, must-revalidate, max-age=0',
      'Content-Type':
        'multipart/form-data; boundary=---011000010111000001101001',
      Authorization: `Bearer ${this.apiToken}`
    }

    const sendRequest = async () => {
      const client = new HttpClient()
      const rawResponse = await client.post(url, body, headers)
      if (!rawResponse) throw new Error('Missing Cloudflare response body')
      const responseBody = await rawResponse.readBody()
      const response: CloudflareResponse = JSON.parse(responseBody)
      console.log('Deploy successful: ', response.result)

      return response.result
    }

    let attempt = 0
    const maxAttempts = 3
    let result: CloudflareResponse['result'] | undefined
    do {
      try {
        result = await sendRequest()
      } catch (error) {
        console.log(`Deploy attempt ${attempt + 1}, failed: `, error)
        if (attempt >= maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
      }
      attempt++
    } while (attempt < maxAttempts && !result)

    return result
  }
}
