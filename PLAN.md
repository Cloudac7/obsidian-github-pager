# Obsidian GitHub Pager - Implementation Plan

## 1. Architecture Overview

### Core Modules
1.  **SettingsManager**: Handles configuration (GitHub Token, Repo Owner/Name, Base Path, Commit Message Template).
2.  **GitHubAdapter**: Wrapper around `Octokit` (REST API).
    -   Handles Authentication.
    -   File Operations: `getContent` (for SHA), `createOrUpdateFile`, `deleteFile`, `getTree`.
    -   *Why Octokit?* Compatible with Obsidian Mobile (no native git binary required).
3.  **SyncEngine**: The brain of the plugin.
    -   Manages the sync queue (debounced pushes).
    -   Tracks file state (local mtime vs remote SHA) to minimize API calls.
    -   Handles "Bi-directional" logic (Poll remote -> Pull if newer; Push local on save).
4.  **ContentProcessor**:
    -   **LinkConverter**: Transforms `[[WikiLinks]]` to `[Markdown Links](path)`.
    -   **ImageHandler**: Extracts embedded images `![[image.png]]`, uploads them to `static/images`, and rewrites links.
    -   **FrontmatterHandler**: Injects/Updates frontmatter (e.g., `share: true`, `last_synced`).

### Data Flow
-   **Push (Local -> Remote)**:
    1.  User modifies file -> `vault.on('modify')`.
    2.  Check Frontmatter `share: true`.
    3.  `ContentProcessor` transforms content (Links/Images).
    4.  `GitHubAdapter` fetches remote SHA (if exists).
    5.  `GitHubAdapter` pushes content.
-   **Pull (Remote -> Local)**:
    1.  Interval/Manual Trigger.
    2.  `GitHubAdapter` fetches repo tree (recursive).
    3.  Compare remote SHA/mtime with local state.
    4.  Download changed files -> Update Vault.

## 2. Configuration Schema (`data.json`)
```typescript
interface PluginSettings {
  githubToken: string;
  repositoryOwner: string;
  repositoryName: string;
  basePath: string; // e.g., "content/posts"
  imagePath: string; // e.g., "static/images"
  commitMessage: string; // e.g., "Update {{file}} via Obsidian"
  autoSync: boolean;
  syncInterval: number; // in minutes
}
```

## 3. Implementation Phases

### Phase 1: Foundation & Auth
-   Set up plugin structure.
-   Implement Settings Tab.
-   Integrate `Octokit`.
-   Verify Authentication (List repos or get user profile).

### Phase 2: Manual Push (One-Way)
-   Create "Push Current File" command.
-   Implement `share: true` check.
-   Implement basic `createOrUpdateFile` logic.
-   Handle "File exists" (Get SHA first).

### Phase 3: Content Transformation
-   Implement `WikiLink` -> `Markdown` conversion.
-   Implement Image upload and link rewriting.
-   *Challenge*: Resolving relative paths correctly for the target site generator (Hugo/Jekyll).

### Phase 4: Bi-directional Sync
-   Implement `vault.on('modify')` listener with debounce.
-   Implement `vault.on('delete')` for auto-cleanup.
-   Implement Polling mechanism for Remote changes.
-   Conflict resolution strategy (Start with "Server Wins" or "Local Wins", move to "Keep Both" later).

## 4. Edge Cases & Challenges
-   **Renaming Files**:
    -   Obsidian: `rename` event.
    -   GitHub: No direct rename. Must `delete` old path + `create` new path.
-   **Rate Limiting**: GitHub API has limits (5000/hr). Cache SHAs locally to avoid `GET` requests on every sync.
-   **Concurrency**: Handling rapid edits while a sync is in progress. Queue system required.
