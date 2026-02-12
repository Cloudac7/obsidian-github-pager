# GitHub Pager

Treat Obsidian as a Headless CMS. Selectively publish notes and images to a GitHub repository, compatible with Hugo, Jekyll, Hexo, and other static site generators.

## Features

- **On-demand Publishing**: Control which files to publish using Frontmatter (`share: true`).
- **Multi-repo Support**: Your vault stays local; only shared content goes to the specified GitHub repo.
- **Auto-Sync**: Automatically pushes changes to GitHub when you save a shared file.
- **Link Transformation**: Converts `[[WikiLinks]]` to standard `[Markdown Links](/path/to/note.md)`.
- **Image Handling**: Automatically uploads embedded images `![[image.png]]` to a dedicated `static/images` folder and rewrites links.

## Installation

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the plugin.
4. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-github-pager/` folder.
5. Enable the plugin in Obsidian Settings.

## Configuration

Go to **Settings > Obsidian GitHub Pager** and configure:

- **GitHub Token**: A Personal Access Token (PAT) with `repo` scope. See [Creating a personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). Ensure the token has access to the target repository with content write permissions.
- **Repository Owner**: Your GitHub username or organization.
- **Repository Name**: The name of the destination repository.
- **Base Path**: Folder in the repo where notes should be saved (e.g., `content/posts`).
- **Image Path**: Folder in the repo where images should be saved (e.g., `static/images`).
- **Commit Message**: Template for commit messages (use `{file}` to include the filename).
- **Auto Sync**: Enable to push changes automatically on save.

## Usage

1. You can also manually push the current file using the command in the menu or command palette: `Push Current File to GitHub`
2. If you want to publish a note to custom path, add `remote_path: custom/path/to/dir` to the Frontmatter.
3. When `Auto Sync` is enabled, any time you save a note with `share: true` in the Frontmatter, it will be automatically pushed to GitHub.
4. Check the Obsidian console (Ctrl+Shift+I) for logs and errors.
