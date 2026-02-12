import { App, PluginSettingTab, Setting } from 'obsidian';
import GitHubPagerPlugin from './main';

export class GitHubPagerSettingTab extends PluginSettingTab {
	plugin: GitHubPagerPlugin;

	constructor(app: App, plugin: GitHubPagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('GitHub token')
			.setDesc('The personal access token with repo scope. See https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token')
			.addText(text => text
				.setPlaceholder('It should be something like `ghp_...`')
				.setValue(this.plugin.settings.githubToken)
				.onChange(async (value) => {
					this.plugin.settings.githubToken = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Repository owner')
			.setDesc('The owner of the repository (user or org), like: octocat')
			.addText(text => text
				.setValue(this.plugin.settings.repositoryOwner)
				.onChange(async (value) => {
					this.plugin.settings.repositoryOwner = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Repository name')
			.setDesc('The name of the repository, like: hello-world')
			.addText(text => text
				.setValue(this.plugin.settings.repositoryName)
				.onChange(async (value) => {
					this.plugin.settings.repositoryName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Base path')
			.setDesc('Path in the repo where notes will be saved (e.g. content/posts).')
			.addText(text => text
				.setPlaceholder('The directory path in the remote repo, e.g. content/posts')
				.setValue(this.plugin.settings.basePath)
				.onChange(async (value) => {
					this.plugin.settings.basePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Image path')
			.setDesc('Path in the repo where images will be saved.')
			.addText(text => text
				.setPlaceholder('The directory path in the remote repo for images, e.g. static/images')
				.setValue(this.plugin.settings.imagePath)
				.onChange(async (value) => {
					this.plugin.settings.imagePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Commit message')
			.setDesc('Commit message template. Use {{file}} as a placeholder for the filename.')
			.addText(text => text
				.setPlaceholder('Update {{file}} via Obsidian')
				.setValue(this.plugin.settings.commitMessage)
				.onChange(async (value) => {
					this.plugin.settings.commitMessage = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto sync')
			.setDesc('Automatically push changes to GitHub when you save a file with the "share" frontmatter property set to true.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSync)
				.onChange(async (value) => {
					this.plugin.settings.autoSync = value;
					await this.plugin.saveSettings();
				}));
	}
}
