import type { CloudflareResponse } from './types'

import axios from 'axios'

export default class Cloudflare {
  private readonly accountID: string
  private readonly apiToken: string

  constructor(accountID: string, apiToken: string) {
    if (!accountID) throw new Error('Missing Cloudflare account ID')
    if (!apiToken) throw new Error('Missing Cloudflare API token')

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
    if (!projectName) throw new Error('Missing Cloudflare Pages project name')

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/pages/projects/${projectName}/deployments`
    const headers = {
      Expires: '0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${this.apiToken}`
    }

    const sendRequest = async () => {
      const response = await axios.postForm(
        url + `?timestamp=${Date.now()}`,
        { branch },
        { headers }
      )
      if (!response) throw new Error('Missing Cloudflare raw response')

      return response.data
    }

    let attempt = 0
    const maxAttempts = 3
    let response: CloudflareResponse | undefined
    do {
      try {
        response = await sendRequest()
        console.log('Cloudflare response: ', response)
      } catch (error) {
        console.log(`Deploy attempt ${attempt + 1}, failed: `, error)
        if (attempt >= maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
      }
      attempt++
    } while (attempt < maxAttempts && !response)

    console.log('Deploy successful: ', response)

    return response?.result
  }
}
