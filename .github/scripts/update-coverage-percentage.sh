# calculates the average of lines, statements, functions and branches pct in the ./coverage/coverage-summary.json file

#!/bin/bash
set -e

if [ ! -f "./coverage/coverage-summary.json" ]; then
    echo "Could not find coverage file"
    exit 1
fi

total_lines=$(cat ./coverage/coverage-summary.json | jq '.total.lines.pct')
total_statements=$(cat ./coverage/coverage-summary.json | jq '.total.statements.pct')
total_functions=$(cat ./coverage/coverage-summary.json | jq '.total.functions.pct')
total_branches=$(cat ./coverage/coverage-summary.json | jq '.total.branches.pct')

total_sum=$(echo "$total_lines + $total_statements + $total_functions + $total_branches" | bc -l)
echo $(echo "scale=2; $total_sum / 4" | bc)
echo "{\"total\": $(echo "scale=2; $total_sum / 4" | bc)}" > ./coverage/coverage-percentage.json