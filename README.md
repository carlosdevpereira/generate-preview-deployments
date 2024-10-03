# Preview Deployments

## Context

To ensure development branches are, up to a certain degree, reliable and/or stable, it's usually a good practise to create independent "preview" environments to test changes introduced in a pull request.

Cloudflare Pages is a solution with a great "free" tier for this purpose, allowing to build preview apps and attach those to pull requests automatically. However, in a monorepo context, the current approach involves each package of the monorepo having it's own "deployment" comment and status check in the pull requests, resulting in a "comment flood" and making the review process not "ideal".

## How does it work?

This Github Action uses the Cloudflare Pages Rest API to trigger preview deployments and attaches the resulting previews in a single pull request comment.

### Configuring Cloudflare Pages

@todo

### Using this Github Action in a workflow

```
name: on-pull-request
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
    steps:
        - uses: carlosdevpereira/generate-preview-deployments@v1
          with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
            cloudflare-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
            project-label-mapping: '[{ "label": "EXAMPLE-PR-LABEL", "project": "EXAMPLE-CLOUDFLARE-PROJECT-NAME" }]'

```
