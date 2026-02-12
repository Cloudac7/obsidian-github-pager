import { App, TFile, arrayBufferToBase64 } from "obsidian";
import { GitHubAdapter } from "./github-adapter";
import { GitHubPagerSettings } from "./settings";

export class ContentProcessor {
    adapter: GitHubAdapter;
    app: App;
    settings: GitHubPagerSettings;

    constructor(adapter: GitHubAdapter, app: App, settings: GitHubPagerSettings) {
        this.adapter = adapter;
        this.app = app;
        this.settings = settings;
    }

    async process(file: TFile): Promise<string> {
        let content = await this.app.vault.read(file);

        const imageRegex = /!\[\[(.*?)\]\]/g;
        const imageMatches = Array.from(content.matchAll(imageRegex));
        
        for (const match of imageMatches) {
            const fullMatch = match[0];
            const linkText = match[1];
            if (!linkText) continue;

            const parts = linkText.split('|');
            const imageName = parts[0];
            const altText = parts[1];
            
            if (!imageName) continue;
            
            const imageFile = this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);
            if (imageFile) {
                await this.uploadImage(imageFile);
                
                const imagePath = this.settings.imagePath.replace(/^\//, '').replace(/\/$/, '');
                const publicPath = `/${imagePath}/${imageFile.name}`; 
                
                const newLink = `![${altText || imageFile.name}](${publicPath})`;
                content = content.replace(fullMatch, newLink);
            }
        }

        const linkRegex = /\[\[(.*?)\]\]/g;
        const linkMatches = Array.from(content.matchAll(linkRegex));
        for (const match of linkMatches) {
            const fullMatch = match[0];
            const linkText = match[1];
            if (!linkText) continue;
             
            const linkParts = linkText.split('|');
            const linkPath = linkParts[0];
            const alias = linkParts[1];
            
            if (!linkPath) continue;

            const linkedFile = this.app.metadataCache.getFirstLinkpathDest(linkPath, file.path);
            
            if (linkedFile) {
                 const linkedFrontmatter = this.app.metadataCache.getFileCache(linkedFile)?.frontmatter;
                 let basePath = this.settings.basePath;
                 if (linkedFrontmatter?.remote_path && typeof linkedFrontmatter.remote_path === 'string') {
                     basePath = linkedFrontmatter.remote_path;
                 }
                 basePath = basePath.replace(/^\//, '').replace(/\/$/, '');
                 const destPath = `/${basePath}/${linkedFile.name}`;
                 
                 const newLink = `[${alias || linkedFile.basename}](${destPath})`;
                 content = content.replace(fullMatch, newLink);
            }
        }

        return content;
    }

    async uploadImage(file: TFile) {
        const content = await this.app.vault.readBinary(file);
        const contentBase64 = arrayBufferToBase64(content);
        const basePath = this.settings.imagePath.replace(/^\//, '').replace(/\/$/, '');
        const path = `${basePath}/${file.name}`;
        const message = `Upload image ${file.name}`;
        
        try {
            await this.adapter.pushFile(path, contentBase64, message);
        } catch (e) {
            console.error(`Failed to upload image ${file.name}`, e);
        }
    }
}
