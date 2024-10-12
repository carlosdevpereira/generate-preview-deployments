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
  let parsedLabelMapping
  try {
    parsedLabelMapping = JSON.parse(labelMapping) as ProjectMap[]

    if (!Array.isArray(parsedLabelMapping)) {
      throw new Error('Invalid input project-label-mapping')
    }
  } catch (e) {
    throw new Error('Invalid input project-label-mapping')
  }

  /** Ensure project mapping has required properties */
  for (let i = 0; i < parsedLabelMapping.length; i++) {
    const projectMap = parsedLabelMapping[i]
    if (!projectMap.label || !projectMap.project) {
      if (!projectMap.label)
        throw new Error(
          `Invalid input project-label-mapping, missing label property at index ${i}`
        )
      if (!projectMap.project)
        throw new Error(
          `Invalid input project-label-mapping, missing project property at index ${i}`
        )
    }
  }

  /** Ensure pull request context */
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
