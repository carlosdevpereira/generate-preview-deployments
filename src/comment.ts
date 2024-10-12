/** Default header part of the comment */
export const COMMENT_DEFAULT_HEAD = `## ⚡ Preview deployments

| Project      | Previews    |
| :----------- | :---------- |`

interface Line {
  name: string
  url: string
}

export const COMMENT_FOOTER =
  '<sub>With ♡ by [generate-preview-deployments](https://github.com/marketplace/actions/generate-preview-deployments).</sub>'

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
