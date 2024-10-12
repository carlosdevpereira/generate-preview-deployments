import { getConfig } from '@/config'
import projectLabelMappingFixture from '@tests/__fixtures__/project-label-mapping.json'
import pullRequestFixture from '@tests/__fixtures__/pull-request.json'

import * as core from '@actions/core'
import { getInput as getInputFnMock } from '@tests/__mocks__/@actions/core'

describe('src/config.ts', () => {
  it('exports getConfig function', () => {
    expect(getConfig).toBeDefined()
  })

  describe('getConfig', () => {
    describe('when called with all required inputs', () => {
      it('returns a valid config object', () => {
        const config = getConfig()

        expect(config).toEqual({
          projectMap: projectLabelMappingFixture,
          github: {
            token: 'github-token',
            pullRequest: pullRequestFixture
          },
          cloudflare: {
            accountId: 'cloudflare-account-id',
            cloudflareApiToken: 'cloudflare-api-token'
          }
        })
      })
    })

    /** Test for required inputs */
    describe.each([
      'github-token',
      'cloudflare-account-id',
      'cloudflare-api-token',
      'project-label-mapping'
    ])('when called without %s', inputName => {
      beforeEach(() => {
        jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
          if (name === inputName) return ''
          return 'valid-input-value'
        })
      })

      afterEach(() => {
        jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
      })

      it(`throws missing ${inputName} error`, () => {
        expect(() => getConfig()).toThrow('Missing input ' + inputName)
      })
    })

    /** Test for invalid inputs */
    describe('when called with invalid project-label-mapping', () => {
      describe('input type is not valid json syntax', () => {
        beforeEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            if (name === 'project-label-mapping') return 'invalid-input'
            return 'valid-input-value'
          })
        })

        afterEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
        })

        it(`throws invalid project-label-mapping error`, () => {
          expect(() => getConfig()).toThrow(
            'Invalid input project-label-mapping'
          )
        })
      })

      describe('input type is not an array', () => {
        beforeEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            if (name === 'project-label-mapping') return '{}'
            return 'valid-input-value'
          })
        })

        afterEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
        })

        it(`throws invalid project-label-mapping error`, () => {
          expect(() => getConfig()).toThrow(
            'Invalid input project-label-mapping'
          )
        })
      })

      describe('input missing required property `label`', () => {
        beforeEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            if (name === 'project-label-mapping')
              return '[{"project": "project-1"}]'
            return 'valid-input-value'
          })
        })

        afterEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
        })

        it(`throws missing required property label error`, () => {
          expect(() => getConfig()).toThrow(
            'Invalid input project-label-mapping, missing label property at index 0'
          )
        })
      })

      describe('input missing required property `project`', () => {
        beforeEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            if (name === 'project-label-mapping')
              return '[{"label": "label-1"}]'
            return 'valid-input-value'
          })
        })

        afterEach(() => {
          jest.spyOn(core, 'getInput').mockImplementation(getInputFnMock)
        })

        it(`throws missing required property label error`, () => {
          expect(() => getConfig()).toThrow(
            'Invalid input project-label-mapping, missing project property at index 0'
          )
        })
      })
    })
  })
})
