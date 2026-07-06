import { execSync } from "node:child_process";

export type GitBuildInfo = {
  version: string;
  commitCount: number;
  hash: string;
  date: string;
  time: string;
  committedAt: string;
};

function runGit(command: string): string {
  return execSync(command, { encoding: "utf-8" }).trim();
}

function formatVersion(commitCount: number): string {
  if (commitCount > 100) {
    const minor = Math.floor(commitCount / 100);
    const patch = commitCount % 100;
    return `v0.${minor}.${patch}`;
  }

  return `v0.0.${commitCount}`;
}

export function getGitBuildInfo(): GitBuildInfo | null {
  try {
    const hash = runGit("git rev-parse --short HEAD");
    const commitCount = Number.parseInt(runGit("git rev-list --count HEAD"), 10);
    const committedAt = runGit("git log -1 --format=%cI");

    if (!Number.isFinite(commitCount)) {
      return null;
    }

    return {
      version: formatVersion(commitCount),
      commitCount,
      hash,
      date: committedAt.slice(0, 10),
      time: committedAt.slice(11, 16),
      committedAt,
    };
  } catch {
    return null;
  }
}
