import * as core from "@actions/core";
import * as http from "@actions/http-client";
import * as github from "@actions/github";

async function run() {
  try {
    /** Read required inputs */
    const MAPPING = core.getInput("project-label-mapping");
    if (!MAPPING) throw new Error("Missing input project-label-mapping");

    const ACCOUNT_ID = core.getInput("cloudflare-account-id");
    if (!ACCOUNT_ID) throw new Error("Missing input cloudflare-account-id");

    const API_TOKEN = core.getInput("cloudflare-api-token");
    if (!API_TOKEN) throw new Error("Missing input cloudflare-api-token");

    /** Parse project mapping */
    const projectMapping = JSON.parse(MAPPING);
    if (!Array.isArray(projectMapping)) {
      throw new Error("Invalid input project-label-mapping");
    }

    /** Trigger deployments */
    const labels = github.context.payload.pull_request.labels;

    for (const { label, project } of projectMapping) {
      if (!labels.some((l) => l.name === label)) continue;

      const httpClient = new http.HttpClient();
      const response = await httpClient.postJson(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments`,
        { branch: github.context.payload.pull_request.head.ref },
        { authorization: `Bearer ${API_TOKEN}` }
      );

      console.log("Cloudflare Response: ", response.result);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

module.exports = run;
