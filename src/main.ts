import { Plugin, Notice, TFile, arrayBufferToBase64 } from 'obsidian';
import { GitHubPagerSettings, DEFAULT_SETTINGS } from "./settings";
import { GitHubPagerSettingTab } from "./settings-tab";
import { GitHubAdapter } from "./github-adapter";
import { ContentProcessor } from "./content-processor";
import { SyncEngine } from "./sync-engine";

export default class GitHubPagerPlugin extends Plugin {
	settings: GitHubPagerSettings;
	githubAdapter: GitHubAdapter | null = null;
	processor: ContentProcessor | null = null;
	syncEngine: SyncEngine | null = null;

	async onload() {
		await this.loadSettings();

		this.initAdapter();

		this.syncEngine = new SyncEngine(this);
		this.syncEngine.start();

		this.addCommand({
			id: 'test-github-connection',
			name: 'Test GitHub Connection',
			callback: async () => {
				if (!this.githubAdapter) {
					new Notice('GitHub Adapter not initialized. Check settings.');
					return;
				}
				const user = await this.githubAdapter.verifyAuth();
				if (user) {
					new Notice(`Authenticated as ${user}`);
				} else {
					new Notice('Authentication failed. Check token.');
				}
			}
		});

		this.addCommand({
			id: 'push-current-file',
			name: 'Push Current File to GitHub',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file.');
					return;
				}
				if (!this.githubAdapter || !this.processor) {
					new Notice('GitHub Adapter not ready.');
					return;
				}
				
				try {
					await this.pushFile(file);
				} catch (e) {
					console.error(e);
					new Notice('Error pushing file.');
				}
			}
		});

		this.addSettingTab(new GitHubPagerSettingTab(this.app, this));
	}

	async pushFile(file: TFile): Promise<boolean> {
		if (!this.processor || !this.githubAdapter) return false;

		const content = await this.processor.process(file);
		const encoder = new TextEncoder();
		const data = encoder.encode(content);
		const contentBase64 = arrayBufferToBase64(data.buffer);
		
		const basePath = this.settings.basePath.replace(/^\//, '').replace(/\/$/, '');
		const path = basePath ? `${basePath}/${file.name}` : file.name;
		const message = this.settings.commitMessage.replace('{{file}}', file.name);
		
		new Notice(`Pushing ${file.name}...`);
		const success = await this.githubAdapter.pushFile(path, contentBase64, message);
		
		if (success) {
			new Notice(`Successfully pushed ${file.name}`);
		} else {
			new Notice(`Failed to push ${file.name}`);
		}
		return success;
	}




	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.initAdapter();
	}

	initAdapter() {
		if (this.settings.githubToken && this.settings.repositoryOwner && this.settings.repositoryName) {
			const adapter = new GitHubAdapter(
				this.settings.githubToken,
				this.settings.repositoryOwner,
				this.settings.repositoryName
			);
			this.githubAdapter = adapter;
			this.processor = new ContentProcessor(adapter, this.app, this.settings);
		} else {
			this.githubAdapter = null;
			this.processor = null;
		}
	}
}

