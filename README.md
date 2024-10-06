# Preview Deployments

## Context

To ensure development branches are, up to a certain degree, reliable and/or stable, it's a usual practise to create independent "preview" environments to test changes introduced by a pull request.

Cloudflare Pages serves well this purpose, offerig a very generous free plan, allowing to build preview apps and attach them to pull requests automatically. However, in a monorepo architecture, the current approach involves each package of the monorepo having it's own (massive) deployment comment and status check in the pull requests, resulting in a "comment flood" and making the review/manual testing process more confusing.

## How does it work?

This Github Action uses the Cloudflare Pages Rest API to trigger preview deployments and attaches the resulting previews as a single pull request comment.

### Configuring Cloudflare Pages

@todo

### Using this Github Action in a workflow

```
name: On pull request
on:
  pull_request:
    types:
      - labeled
      - unlabeled
      - opened
      - synchronize
      - reopened

jobs:
  generate-previews:
    name: Generate preview environments
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
        - uses: carlosdevpereira/generate-preview-deployments@v1.0.0
          with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
            cloudflare-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
            project-label-mapping: '[{ "label": "EXAMPLE-PR-LABEL", "project": "EXAMPLE-CLOUDFLARE-PROJECT-NAME", "name": "Project name" }]'

```
