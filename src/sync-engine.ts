import { TFile, debounce, Notice } from "obsidian";
import GitHubPagerPlugin from "./main";

export class SyncEngine {
    plugin: GitHubPagerPlugin;
    syncQueue: Set<string> = new Set();
    debouncedProcess: Function;

    constructor(plugin: GitHubPagerPlugin) {
        this.plugin = plugin;
        this.debouncedProcess = debounce(this.processQueue.bind(this), 2000, true);
    }

    start() {
        this.plugin.registerEvent(
            this.plugin.app.vault.on('modify', (file) => {
                if (file instanceof TFile && this.plugin.settings.autoSync) {
                    this.onModify(file);
                }
            })
        );
    }

    onModify(file: TFile) {
        const cache = this.plugin.app.metadataCache.getFileCache(file);
        if (cache?.frontmatter?.share === true) {
            this.syncQueue.add(file.path);
            this.debouncedProcess();
        }
    }

    async processQueue() {
        if (!this.plugin.githubAdapter || !this.plugin.processor) return;

        const paths = Array.from(this.syncQueue);
        this.syncQueue.clear();

        for (const path of paths) {
            const file = this.plugin.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                new Notice(`Auto-syncing ${file.name}...`);
                await this.plugin.pushFile(file);
            }
        }
    }
}
