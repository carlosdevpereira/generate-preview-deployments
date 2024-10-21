import * as core from '@actions/core'
import * as github from '@actions/github'
import getConfig from './config'
import CloudflareClient from './cloudflare'
import Comment, { COMMENT_FOOTER } from './comment'

export async function run(): Promise<void> {
  try {
    console.log('Retrieving action config...')
    const config = getConfig()

    let deployCount = 0
    const comment = new Comment()

    const labels = config.github.pullRequest.labels
    const branch = config.github.pullRequest.head.ref

    for (const map of config.projectMap) {
      if (!labels.some((l: { name: string }) => l.name === map.label)) continue

      const cloudflare = new CloudflareClient(
        config.cloudflare.accountId,
        config.cloudflare.cloudflareApiToken
      )
      console.log('Starting Cloudflare Deployment...')
      console.log('- Project: ' + map.project)
      console.log('- Branch: ' + branch)
      const result = await cloudflare.deploy(map.project, branch)
      if (!result) {
        throw new Error(`Failed to deploy ${map.project} to Cloudflare Pages`)
      }

      deployCount += 1
      comment.appendLine({ name: map.name || map.project, url: result.url })
    }

    if (deployCount === 0) {
      console.log('No projects deployed. Skipping...')
      return
    }

    const commentBody = comment.addTimestamp().getBody()

    /** Creates or updates existing comment */
    console.log('Searching for existing comment...')
    const githubClient = github.getOctokit(config.github.token)
    const comments = await githubClient.rest.issues.listComments({
      ...github.context.repo,
      issue_number: config.github.pullRequest.number
    })

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
        issue_number: config.github.pullRequest.number,
        body: commentBody
      })
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
