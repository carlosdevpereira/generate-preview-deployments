import type { ProjectMap } from './types'

import * as core from '@actions/core'
import * as github from '@actions/github'

export function getConfig() {
  /** Retrieve required inputs */
  const githubToken = core.getInput('github-token')
  if (!githubToken) throw new Error('Missing input github-token')
  const labelMapping = core.getInput('project-label-mapping')
  if (!labelMapping) throw new Error('Missing input project-label-mapping')
  const accountId = core.getInput('cloudflare-account-id')
  if (!accountId) throw new Error('Missing input cloudflare-account-id')
  const cloudflareApiToken = core.getInput('cloudflare-api-token')
  if (!cloudflareApiToken) throw new Error('Missing input cloudflare-api-token')

  /** Parse project mapping */
  const parsedLabelMapping = JSON.parse(labelMapping) as ProjectMap[]
  if (!Array.isArray(parsedLabelMapping)) {
    throw new Error('Invalid input project-label-mapping')
  }

  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) throw new Error('Missing pull request context')

  return {
    projectMap: parsedLabelMapping,
    github: {
      token: githubToken,
      pullRequest
    },
    cloudflare: {
      accountId,
      cloudflareApiToken
    }
  }
}

export default getConfig
