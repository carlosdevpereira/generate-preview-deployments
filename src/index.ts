import type { ProjectMap } from './types'

import * as core from '@actions/core'
import * as github from '@actions/github'
import CloudflareClient from './cloudflare'
import Comment, { COMMENT_FOOTER } from './comment'

export async function run(): Promise<void> {
  try {
    /** Retrieve required inputs */
    const GITHUB_TOKEN = core.getInput('github-token')
    if (!GITHUB_TOKEN) throw new Error('Missing input github-token')
    const MAPPING = core.getInput('project-label-mapping')
    if (!MAPPING) throw new Error('Missing input project-label-mapping')
    const ACCOUNT_ID = core.getInput('cloudflare-account-id')
    if (!ACCOUNT_ID) throw new Error('Missing input cloudflare-account-id')
    const API_TOKEN = core.getInput('cloudflare-api-token')
    if (!API_TOKEN) throw new Error('Missing input cloudflare-api-token')

    /** Parse project mapping */
    const projectMapping = JSON.parse(MAPPING) as ProjectMap[]
    if (!Array.isArray(projectMapping)) {
      throw new Error('Invalid input project-label-mapping')
    }

    const pullRequest = github.context.payload.pull_request
    if (!pullRequest) throw new Error('Missing pull request context')

    const comment = new Comment()
    const labels = pullRequest.labels
    const branch = pullRequest.head.ref

    for (const map of projectMapping) {
      if (!labels.some((l: { name: string }) => l.name === map.label)) continue

      /** Trigger Cloudflare deployment */
      const cloudflare = new CloudflareClient(ACCOUNT_ID, API_TOKEN)
      const result = await cloudflare.deploy(map.project, branch)
      if (!result) {
        throw new Error(`Failed to deploy ${map.project} to Cloudflare Pages`)
      }

      /** Add deployment to PR comment draft */
      comment.appendLine({ name: map.name || map.project, url: result.url })
    }

    /** Creates or updates existing comment */
    console.log('Searching for existing PR comment...')
    const githubClient = github.getOctokit(GITHUB_TOKEN)
    const comments = await githubClient.rest.issues.listComments({
      ...github.context.repo,
      issue_number: pullRequest.number
    })

    const commentBody = comment.addTimestamp().getBody()
    let commentId = null
    for (const comment of comments.data) {
      if (comment.body?.includes(COMMENT_FOOTER)) {
        commentId = comment.id
        break
      }
    }

    if (commentId) {
      console.log('Updating existing PR comment with ID ' + commentId + '...')
      await githubClient.rest.issues.updateComment({
        ...github.context.repo,
        comment_id: commentId,
        body: commentBody
      })
    } else {
      console.log('Creating new PR comment...')
      await githubClient.rest.issues.createComment({
        ...github.context.repo,
        issue_number: pullRequest.number,
        body: commentBody
      })
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
