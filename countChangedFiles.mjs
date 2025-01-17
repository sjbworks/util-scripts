import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// GitHub APIトークンとリポジトリ情報を設定
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const API_ENDPOINT = process.env.API_ENDPOINT;

// 取得したい件数を設定
const PR_COUNT = 100;

// ヘッダーを設定
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

// PR情報を取得
async function getMergedPRs() {
  const url = `${API_ENDPOINT}/repos/${OWNER}/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100`;
  const response = await fetch(url, { headers });
  const prs = await response.json();
  const mergedPRs = prs.filter((pr) => pr.merged_at !== null);
  return mergedPRs.slice(0, PR_COUNT);
}

// PRごとの変更ファイル数を取得
async function getTotalChangedFiles(prs) {
  let totalFiles = 0;
  for (const pr of prs) {
    const prNumber = pr.number;
    const url = `${API_ENDPOINT}/repos/${OWNER}/${REPO}/pulls/${prNumber}/files`;
    const response = await fetch(url, { headers });
    const files = await response.json();
    totalFiles += files.length;
  }
  return totalFiles;
}

(async () => {
  try {
    const mergedPRs = await getMergedPRs();
    const totalChangedFiles = await getTotalChangedFiles(mergedPRs);
    console.log(
      `Total changed files in the last ${PR_COUNT} merged PRs: ${totalChangedFiles}`
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
