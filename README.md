# Preview Deployments

[![Unit tests](https://github.com/carlosdevpereira/generate-preview-deployments/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/carlosdevpereira/generate-preview-deployments/actions/workflows/unit-tests.yml)
[![Coverage](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fcarlosdevpereira-preview-deployments.pages.dev%2Fcoverage-percentage.json&query=%24.coverage&suffix=%25&logo=2fas&logoColor=aaa&label=Coverage&color=rgb(50%2C%20199%2C%2084))](https://carlosdevpereira-preview-deployments.pages.dev)

## Context

To ensure development branches are, up to a certain degree, reliable and/or stable, it's a usual practise to create independent "preview" environments to test changes introduced by a pull request.

Cloudflare Pages serves well this purpose, offering a very generous free plan, allowing to build preview apps and attach them to pull requests automatically. However, in a monorepo architecture, the current approach involves each package of the monorepo having it's own (massive) deployment comment and status check in the pull requests, resulting in a "comment flood" and making the review/manual testing process more confusing.

## How does it work?

This Github Action uses the Cloudflare Pages Rest API to trigger preview deployments and attaches the resulting previews as a single pull request comment.

### Configuring Cloudflare Pages

@todo

### Example using this Github Action

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
        - uses: carlosdevpereira/generate-preview-deployments@v1
          with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
            cloudflare-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
            project-label-mapping: '[{ "label": "EXAMPLE-PR-LABEL", "project": "EXAMPLE-CLOUDFLARE-PROJECT-NAME", "name": "Project name" }]'

```
<br/>

| Input                   | Description                           |
| :---------------------- | :------------------------------------ |
| `github-token`          | A Github access token, with permissions to write on pull requests and issues. <br/> - This token is used to create or update pull request comments in the repository running this Github action. <br/> - Can be the default `GITHUB_TOKEN`, or a personal access token from a Github user. |
| `cloudflare-account-id` | The Account ID of a Cloudflare account with access to the Cloudflare Pages projects configured in the `project-label-mapping` input.
| `cloudflare-api-token`  | A Cloudflare API token, generated in Cloudflare dashboard, with permissions to create deployments in the Cloudflare Pages projects configured in the `project-label-mapping` input.
| `project-label-mapping` | A mapping between labels in your pull requests and projects in Cloudflare Pages. Whenever one of these labels appears in a pull request, a deployment will be triggered for the selected Cloudflare Pages project. | 

## Notes
Access tokens passed as inputs to this action are not stored, logged or sent to any untrustworthy third party (check the code yourself).
  - `github-token` is only used to authenticate within Github octokit
  - `cloudflare-account-id` and `cloudflare-api-token` are only used to trigger HTTP requests to Cloudflare API.
