import { Octokit } from "@octokit/rest";
import type { EndpointDefaults } from "@octokit/types";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";

const MyOctokit = Octokit.plugin(retry, throttling);

export class GitHubAdapter {
    octokit: Octokit;
    owner: string;
    repo: string;

    constructor(token: string, owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;
        this.octokit = new MyOctokit({
            auth: token,
            userAgent: 'obsidian-github-pager',
            throttle: {
                onRateLimit: (retryAfter: number, options: EndpointDefaults, octokit: Octokit) => {
                    if (options !== undefined) {
                        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
                        if (options.request && options.request.retryCount < 3) {
                            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
                            return true;
                        }
                    }
                    return false;
                },
                onSecondaryRateLimit: (retryAfter: number, options: EndpointDefaults, octokit: Octokit) => {
                    octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
                    return true;
                },
            },
        });
    }

    async verifyAuth(): Promise<string | null> {
        try {
            const { data } = await this.octokit.users.getAuthenticated();
            return data.login;
        } catch (e) {
            console.error("GitHub Auth Failed", e);
            return null;
        }
    }

    async pushFile(path: string, contentBase64: string, message: string): Promise<boolean> {
        try {
            let sha: string | undefined;
            try {
                const { data } = await this.octokit.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path: path,
                });
                if (Array.isArray(data)) {
                    console.error("Path is a directory, not a file");
                    return false;
                }
                sha = data.sha;
            } catch (e: unknown) {
                const error = e as { status: number };
                if (error.status !== 404) {
                    throw e;
                }
            }

            await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path: path,
                message: message,
                content: contentBase64,
                sha: sha,
            });
            return true;
        } catch (e) {
            console.error("Push failed", e);
            return false;
        }
    }
}
