/** Default header part of the comment */
const COMMENT_DEFAULT_HEAD = `## Deployed Preview Environments

|      | Previews    |
| :--- | :---        |`

interface Line {
  name: string
  url: string
}

export const COMMENT_FOOTER =
  '<sub>Generated with ♡ using `generate-preview-deployments` action.</sub>'

export default class Comment {
  private body: string

  constructor(header: string = COMMENT_DEFAULT_HEAD) {
    this.body = header
    return this
  }

  public getBody(): string {
    return `${this.body}
${COMMENT_FOOTER}`
  }

  public appendLine(line: Line) {
    this.body += `\n| ${line.name} | ${line.url} |`

    return this
  }

  public addTimestamp() {
    const date = new Date()
    this.body += `\n\n> Previews generated at ${date.toLocaleString()}`

    return this
  }
}
