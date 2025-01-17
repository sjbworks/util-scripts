import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const API_ENDPOINT = process.env.API_ENDPOINT;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

async function fetchPRs() {
  const now = new Date();
  const fourMonthsAgo = new Date(
    now.setMonth(now.getMonth() - 4)
  ).toISOString();
  const url = `${API_ENDPOINT}/repos/${OWNER}/${REPO}/pulls?state=all&sort=created&direction=desc&per_page=100`;

  let prs = [];

  for (let page = 1; ; page++) {
    const response = await fetch(`${url}&page=${page}`, { headers });
    if (!response.ok) {
      throw new Error(
        `GitHub API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.length === 0) break;

    const filteredPRs = data.filter(
      (pr) => new Date(pr.created_at) >= new Date(fourMonthsAgo)
    );
    prs = prs.concat(filteredPRs);

    // すべての必要なPRを取得したらループを終了
    if (filteredPRs.length < data.length) break;
  }

  return prs;
}

function calculateAveragePRs(prs) {
  const userPRCounts = {};
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 4);

  prs.forEach((pr) => {
    const user = pr.user.login;
    const createdAt = new Date(pr.created_at);

    if (createdAt >= startDate) {
      if (!userPRCounts[user]) {
        userPRCounts[user] = 0;
      }
      userPRCounts[user] += 1;
    }
  });

  const totalDays = (new Date() - startDate) / (1000 * 60 * 60 * 24);
  const averagePRsPerUserPerDay = {};

  for (const user in userPRCounts) {
    averagePRsPerUserPerDay[user] = userPRCounts[user] / totalDays;
  }

  return averagePRsPerUserPerDay;
}

(async () => {
  try {
    const prs = await fetchPRs();
    const averages = calculateAveragePRs(prs);
    console.log(
      "Average PRs per user per day over the last 4 months:",
      averages
    );
  } catch (error) {
    console.error("Error executing script:", error);
  }
})();
