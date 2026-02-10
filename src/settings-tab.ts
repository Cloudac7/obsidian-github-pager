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
			.setName('GitHub Token')
			.setDesc('Personal Access Token (PAT) with repo scope.')
			.addText(text => text
				.setPlaceholder('ghp_...')
				.setValue(this.plugin.settings.githubToken)
				.onChange(async (value) => {
					this.plugin.settings.githubToken = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Repository Owner')
			.setDesc('The owner of the repository (user or org).')
			.addText(text => text
				.setPlaceholder('octocat')
				.setValue(this.plugin.settings.repositoryOwner)
				.onChange(async (value) => {
					this.plugin.settings.repositoryOwner = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Repository Name')
			.setDesc('The name of the repository.')
			.addText(text => text
				.setPlaceholder('my-blog')
				.setValue(this.plugin.settings.repositoryName)
				.onChange(async (value) => {
					this.plugin.settings.repositoryName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Base Path')
			.setDesc('Path in the repo where notes will be saved (e.g. content/posts).')
			.addText(text => text
				.setPlaceholder('content/posts')
				.setValue(this.plugin.settings.basePath)
				.onChange(async (value) => {
					this.plugin.settings.basePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Image Path')
			.setDesc('Path in the repo where images will be saved.')
			.addText(text => text
				.setPlaceholder('static/images')
				.setValue(this.plugin.settings.imagePath)
				.onChange(async (value) => {
					this.plugin.settings.imagePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
