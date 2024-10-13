const fs = require('fs')
const path = require('path')

const coverageSummaryPath = path.join(
  __dirname,
  '../../coverage/coverage-summary.json'
)
const coveragePercentagePath = path.join(
  __dirname,
  '../../coverage/coverage-percentage.json'
)
const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'))
const linesPct = coverageSummary.total.lines.pct
const statementsPct = coverageSummary.total.statements.pct
const functionsPct = coverageSummary.total.functions.pct
const branchesPct = coverageSummary.total.branches.pct

const totalPct = (linesPct + statementsPct + functionsPct + branchesPct) / 4
const roundedPct = Math.round(totalPct * 100) / 100

fs.writeFileSync(
  coveragePercentagePath,
  JSON.stringify({ coverage: roundedPct }, null, 2)
)
