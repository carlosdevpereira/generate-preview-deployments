import projectLabelMapping from '@tests/__fixtures__/project-label-mapping.json'

export const getInput = jest.fn((name: string) => {
  if (name === 'github-token') return 'github-token'
  if (name === 'project-label-mapping')
    return JSON.stringify(projectLabelMapping)
  if (name === 'cloudflare-account-id') return 'cloudflare-account-id'
  if (name === 'cloudflare-api-token') return 'cloudflare-api-token'

  throw new Error('Unknown input')
})

export const setFailed = jest.fn(error => {
  console.error(error)
})

export const info = jest.fn(message => {
  console.log(message)
})

export const debug = jest.fn(message => {
  console.log(message)
})
