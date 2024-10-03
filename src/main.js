import * as core from "@actions/core";
import * as github from "@actions/github";
import * as FormData from "form-data";
import * as httpClient from "@actions/http-client";

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

      let url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments`;

      const form = new FormData();
      form.append("branch", github.context.payload.pull_request.head.ref);

      const headers = form.getHeaders();
      headers.Authorization = `Bearer ${API_TOKEN}`;

      const http = new httpClient.HttpClient();
      const response = await http.post(url, form, headers);
      const result = await response.readBody();

      console.log("Cloudflare Response: ", result);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default run;
