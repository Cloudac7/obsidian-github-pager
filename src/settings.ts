export interface GitHubPagerSettings {
	githubToken: string;
	repositoryOwner: string;
	repositoryName: string;
	basePath: string; // e.g., "content/posts"
	imagePath: string; // e.g., "static/images"
	commitMessage: string;
	autoSync: boolean;
	syncInterval: number; // in minutes
}

export const DEFAULT_SETTINGS: GitHubPagerSettings = {
	githubToken: '',
	repositoryOwner: '',
	repositoryName: '',
	basePath: 'content/posts',
	imagePath: 'static/images',
	commitMessage: 'Update {{file}} via Obsidian',
	autoSync: false,
	syncInterval: 15
}
