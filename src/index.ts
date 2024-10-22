import * as core from '@actions/core'
import * as github from '@actions/github'
import getConfig from './config'
import CloudflareClient from './cloudflare'
import Comment, { COMMENT_FOOTER } from './comment'

export async function run(): Promise<void> {
  try {
    core.debug('Retrieving action config...')
    const config = getConfig()

    let deployCount = 0
    const comment = new Comment()

    const labels: Array<{ name: string }> = config.github.pullRequest.labels
    core.debug(`PR Labels: ${JSON.stringify(labels)}`)

    const branch = config.github.pullRequest.head.ref
    core.info(`Deploying branch: ${branch}`)

    for (let i = 0; i < config.projectMap.length; i++) {
      const map = config.projectMap[i]
      if (!labels.some(l => l.name === map.label)) {
        core.debug(`Label ${map.label} not found. Skipping...`)
        continue
      }

      const cloudflare = new CloudflareClient(
        config.cloudflare.accountId,
        config.cloudflare.cloudflareApiToken
      )

      const result = await cloudflare.deploy(map.project, branch)
      if (!result) throw new Error(`Failed to deploy ${map.project}`)

      deployCount += 1
      core.info(`Deployed ${map.name || map.project} to ${result.url}`)
      comment.appendLine({ name: map.name || map.project, url: result.url })
    }

    if (deployCount === 0) {
      core.info('No projects deployed. Skipping...')
      return
    }

    const commentBody = comment.addTimestamp().getBody()

    /** Creates or updates existing comment */
    core.debug('Searching for existing comment...')
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
      core.info('Updating existing PR comment with ID ' + commentId + '...')
      await githubClient.rest.issues.updateComment({
        ...github.context.repo,
        comment_id: commentId,
        body: commentBody
      })
    } else {
      core.info('Creating new PR comment...')
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
