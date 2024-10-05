import * as core from '@actions/core'
import * as github from '@actions/github'
import { HttpClient } from '@actions/http-client'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    /** Read required inputs */
    const MAPPING = core.getInput('project-label-mapping')
    if (!MAPPING) throw new Error('Missing input project-label-mapping')

    const ACCOUNT_ID = core.getInput('cloudflare-account-id')
    if (!ACCOUNT_ID) throw new Error('Missing input cloudflare-account-id')

    const API_TOKEN = core.getInput('cloudflare-api-token')
    if (!API_TOKEN) throw new Error('Missing input cloudflare-api-token')

    /** Parse project mapping */
    const projectMapping = JSON.parse(MAPPING)
    if (!Array.isArray(projectMapping)) {
      throw new Error('Invalid input project-label-mapping')
    }

    /** Trigger deployments */
    const labels = github.context.payload.pull_request?.labels
    const branch = github.context.payload.pull_request?.head.ref
    console.log(
      'Branch: ',
      branch,
      ' PR Labels: ',
      JSON.stringify(labels, null, 2)
    )
    for (const { label, project } of projectMapping) {
      if (!labels.some((l: { name: string }) => l.name === label)) continue

      let url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments`

      const headers = {
        'Content-Type':
          'multipart/form-data; boundary=---011000010111000001101001',
        Authorization: `Bearer ${API_TOKEN}`
      }

      const http = new HttpClient()
      const response = await http.post(
        url,
        `-----011000010111000001101001\r\nContent-Disposition: form-data; name="branch"\r\n\r\n${branch}\r\n-----011000010111000001101001--\r\n\r\n`,
        headers
      )
      const result = await response.readBody()

      console.log('Cloudflare Response: ', result)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
