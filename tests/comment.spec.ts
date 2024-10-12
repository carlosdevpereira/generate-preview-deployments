import Comment, { COMMENT_DEFAULT_HEAD, COMMENT_FOOTER } from '@/comment'

describe('src/comment.ts', () => {
  it('exports Comment class', () => {
    expect(Comment).toBeDefined()
    expect(Comment).toBeInstanceOf(Function)
  })

  it('exports COMMENT_FOOTER', () => {
    expect(COMMENT_FOOTER).toBeDefined()
  })

  it('exports COMMENT_DEFAULT_HEAD', () => {
    expect(COMMENT_DEFAULT_HEAD).toBeDefined()
  })

  describe('when called with no arguments', () => {
    it('returns body with header and footer', () => {
      const comment = new Comment()

      expect(comment.getBody()).toEqual(`${COMMENT_DEFAULT_HEAD}
${COMMENT_FOOTER}`)
    })
  })

  describe('when called with arguments', () => {
    it('returns body with custom header', () => {
      const comment = new Comment('custom-header')
      expect(comment.getBody()).toEqual(`custom-header
${COMMENT_FOOTER}`)
    })
  })

  describe('when lines are added to the comment', () => {
    it('returns body with added lines', () => {
      const comment = new Comment()
      comment.appendLine({
        name: 'Project 1',
        url: 'https://carlosdevpereira.com'
      })

      expect(comment.getBody()).toEqual(`${COMMENT_DEFAULT_HEAD}
| Project 1 | https://carlosdevpereira.com |
${COMMENT_FOOTER}`)
    })
  })

  describe('when timestamp is added to the comment', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
        return 1600000000000
      })
    })

    it('returns body with added lines', () => {
      const comment = new Comment()
      comment.appendLine({
        name: 'Project 1',
        url: 'https://carlosdevpereira.com'
      })

      comment.addTimestamp()

      expect(comment.getBody()).toEqual(`${COMMENT_DEFAULT_HEAD}
| Project 1 | https://carlosdevpereira.com |

> Previews generated at ${new Date().toLocaleString()}
${COMMENT_FOOTER}`)
    })
  })
})
