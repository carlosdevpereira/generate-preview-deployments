import type { CloudflareResponse } from './types'
import type { AxiosError } from 'axios'
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
      Authorization: `Bearer ${this.apiToken}`
    }

    const sendRequest = async () => {
      let result
      try {
        const { data } = await axios.postForm(url, { branch }, { headers })
        if (data) result = data.result
      } catch (error) {
        if ((error as AxiosError).response?.status === 304) {
          const { data } = await axios.get(url, { headers })
          if (data && data.result) result = data.result[0]
        }
      }

      if (!result) throw new Error('Missing Cloudflare deployment result')
      return result
    }

    let attempt = 0
    const maxAttempts = 3
    let response: CloudflareResponse['result'] | undefined
    do {
      try {
        response = await sendRequest()
      } catch (error) {
        console.log(`Deploy attempt ${attempt + 1}, failed: `, error)
        if (attempt >= maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
      }
      attempt++
    } while (attempt < maxAttempts && !response)

    return response
  }
}
