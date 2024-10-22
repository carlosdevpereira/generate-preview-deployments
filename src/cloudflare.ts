import * as core from '@actions/core'
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
    core.info(`Starting deployment of ${projectName} from branch ${branch}`)

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/pages/projects/${projectName}/deployments`
    const headers = {
      Authorization: `Bearer ${this.apiToken}`
    }

    let result
    try {
      const response = await axios.postForm(url, { branch }, { headers })
      if (response?.data) result = response?.data.result
    } catch (error) {
      if ((error as AxiosError).response?.status === 304) {
        core.debug(`${projectName} not changed since last deployment.`)
        core.debug(`Retrieving previous deployment info...`)

        const response = await axios.get(`${url}?env=preview`, { headers })
        if (response?.data && response?.data.result) {
          const branchDeployments = response?.data.result.filter(
            (deployment: CloudflareResponse['result']) =>
              deployment.deployment_trigger.metadata.branch === branch
          )
          result = branchDeployments[0]
          core.debug(`Found previous deployment with url: ${result.url}`)
        } else {
          core.debug(`Could not retrieve previous deployment.`)
          throw error
        }
      } else {
        throw error
      }
    }

    return result
  }
}
