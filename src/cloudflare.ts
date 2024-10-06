import { HttpClient } from '@actions/http-client'

export interface CloudflareResponse {
  success: boolean
  errors: any[]
  messages: any[]
  result: {
    id: string
    short_id: string
    project_id: string
    project_name: string
    environment: string
    url: string
    created_on: string
    modified_on: string
    deployment_trigger: {
      type: string
      metadata: {
        branch: string
        commit_hash: string
        commit_message: string
        commit_dirty: boolean
      }
    }
  }
}

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
    const headers = {
      'Content-Type':
        'multipart/form-data; boundary=---011000010111000001101001',
      Authorization: `Bearer ${this.apiToken}`
    }

    const body = `---011000010111000001101001
Content-Disposition: form-data; name="branch"

${branch}
---011000010111000001101001`

    const client = new HttpClient()
    const response = await client.post(url, body, headers)
    const responseBody = await response.readBody()
    console.log("raw response body: ", responseBody)

    if (!responseBody) throw new Error('Missing Cloudflare response body')
    const parsedBody = JSON.parse(JSON.stringify(responseBody)) as CloudflareResponse
    console.log("parsed body: ", parsedBody)
    const result = parsedBody.result
    console.log("result: ", result)
    return result
  }
}
