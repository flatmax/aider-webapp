import {html} from 'lit';

export class GitDiffRenderer {
  constructor(GitDiffView) {
    this.view = GitDiffView;
  }

  render() {
    return html`
      ${this.renderHeader()}
      ${this.renderRawGitStatus()}
      ${this.renderContent()}
    `;
  }

  renderHeader() {
    return html`
      <div class="git-diff-header">
        <div class="commit-info">
          ${this.view.gitEditorMode ? html`
            <span class="git-editor-indicator">📝 ${this.view.gitEditorFile?.description || 'Git Editor'}</span>
          ` : this.view.rebaseCompleting ? html`
            <span class="rebase-indicator">🔄 Rebase Paused - User Action Required</span>
          ` : this.view.rebaseInProgress ? html`
            <span class="rebase-indicator">🔄 Rebase in Progress${this.view.hasConflicts ? ' - Resolving Conflicts' : ''}</span>
          ` : html`
            <span>From: <span class="commit-hash">${this.view.fromCommit?.substring(0, 7) || 'None'}</span></span>
            <span>→</span>
            <span>To: <span class="commit-hash">${this.view.toCommit?.substring(0, 7) || 'None'}</span></span>
            ${this.view.gitHistoryMode ? html`<span class="read-only-indicator">(Read-only)</span>` : ''}
          `}
        </div>
        
        <div class="header-controls">
          ${this.renderRebaseControls()}
          ${!this.view.rebaseCompleting && !this.view.gitEditorMode ? html`
            <button class="refresh-button" title="Refresh Rebase Status" @click=${() => this.view.refreshRebaseStatus()}>
              🔄
            </button>
            <button class="view-toggle-button" @click=${() => this.view.toggleViewMode()}>
              ${this.view.unifiedView ? 'Side-by-Side' : 'Unified'}
            </button>
            <button class="nav-button" title="Previous Change" @click=${() => this.view.goToPreviousChunk()}>
              <span class="nav-icon">▲</span>
            </button>
            <button class="nav-button" title="Next Change" @click=${() => this.view.goToNextChunk()}>
              <span class="nav-icon">▼</span>
            </button>
          ` : ''}
          ${(this.view.rebaseInProgress || this.view.rebaseCompleting || this.view.gitEditorMode) ? html`
            <button 
              class="raw-status-toggle-button ${this.view.showRawGitStatus ? 'active' : ''}" 
              title="Toggle Raw Git Status" 
              @click=${() => this.view.toggleRawGitStatus()}>
              Terminal
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderRawGitStatus() {
    if (!this.view.showRawGitStatus || !this.view.rawGitStatus) return '';
    
    return html`
      <div class="raw-git-status-container">
        <div class="raw-git-status-header">
          <span class="raw-git-status-title">Git Status (Terminal Output)</span>
          <div class="raw-git-status-controls">
            <button class="raw-git-status-refresh" @click=${() => this.view.refreshRawGitStatus()}>
              🔄
            </button>
            <button class="raw-git-status-close" @click=${() => this.view.toggleRawGitStatus()}>
              ✕
            </button>
          </div>
        </div>
        <div class="raw-git-status-content">
          <pre>${this.view.rawGitStatus}</pre>
        </div>
      </div>
    `;
  }

  renderRebaseControls() {
    if (this.view.gitEditorMode) {
      return html`
        <button class="save-git-editor-button" @click=${() => this.view.rebaseManager.saveGitEditorFile()} ?disabled=${this.view.loading}>
          ${this.view.loading ? 'Saving...' : 'Save & Continue'}
        </button>
        <button class="abort-button" @click=${() => this.view.rebaseManager.abortRebase()} ?disabled=${this.view.loading}>
          Abort
        </button>
      `;
    }

    if (!this.view.gitHistoryMode || !this.view.fromCommit || !this.view.toCommit) return '';

    if (this.view.rebaseCompleting) {
      return html`
        <button class="continue-button" @click=${() => this.view.rebaseManager.continueRebase()} ?disabled=${this.view.loading}>
          ${this.view.loading ? 'Continuing...' : 'Continue Rebase'}
        </button>
        <button class="commit-button" @click=${() => this.view.rebaseManager.commitChanges()} ?disabled=${this.view.loading}>
          Commit Changes
        </button>
        <button class="commit-amend-button" @click=${() => this.view.rebaseManager.commitAmend()} ?disabled=${this.view.loading}>
          Commit --amend
        </button>
        <button class="abort-button" @click=${() => this.view.rebaseManager.abortRebase()} ?disabled=${this.view.loading}>
          Abort Rebase
        </button>
      `;
    }

    if (this.view.rebaseInProgress) {
      return html`
        <button class="abort-button" @click=${() => this.view.rebaseManager.abortRebase()} ?disabled=${this.view.loading}>
          Abort Rebase
        </button>
      `;
    }

    if (this.view.rebaseMode) {
      return html`
        <button class="execute-button" @click=${() => this.view.rebaseManager.executeRebase()} ?disabled=${this.view.loading}>
          Execute Rebase
        </button>
        <button class="cancel-button" @click=${() => this.view.rebaseManager.resetRebaseState()}>
          Cancel
        </button>
      `;
    }

    return html`
      <button class="rebase-button" @click=${() => this.view.rebaseManager.startInteractiveRebase()} ?disabled=${this.view.loading}>
        Interactive Rebase
      </button>
    `;
  }

  renderConflictControls() {
    if (!this.view.hasConflicts) return '';
    
    return html`
      <div class="conflict-controls">
        <div class="conflict-info">
          Conflict in ${this.view.selectedFile} (${this.view.conflictFiles.indexOf(this.view.selectedFile) + 1}/${this.view.conflictFiles.length})
        </div>
        <div class="conflict-buttons">
          <button class="conflict-resolve-button ours" @click=${() => this.view.rebaseManager.resolveConflict('ours')}>
            Accept Ours (Current)
          </button>
          <button class="conflict-resolve-button theirs" @click=${() => this.view.rebaseManager.resolveConflict('theirs')}>
            Accept Theirs (Incoming)
          </button>
          <button class="conflict-resolve-button manual" @click=${() => this.view.rebaseManager.resolveConflict('manual')}>
            Use Manual Resolution
          </button>
        </div>
      </div>
    `;
  }

  renderGitEditorHelp() {
    if (!this.view.gitEditorMode || !this.view.gitEditorFile)return '';

    return html`
      <div class="git-editor-help">
        <h4>${this.view.gitEditorFile.description}</h4>
        <p>${this.view.gitEditorFile.instructions}</p>
        <p>Click "Save & Continue" when you're done editing.</p>
      </div>
    `;
  }

  renderGitStatus() {
    if (!this.view.gitStatus || (!this.view.rebaseInProgress && !this.view.rebaseCompleting && !this.view.gitEditorMode)) {
      return '';
    }

    const status = this.view.gitStatus;
    const hasChanges = (status.modified_files && status.modified_files.length > 0) ||
                      (status.staged_files && status.staged_files.length > 0) ||
                      (status.untracked_files && status.untracked_files.length > 0);

    if (!hasChanges) return '';

    return html`
      <div class="git-status-panel">
        <h4>Git Status</h4>
        <div class="git-status-content">
          ${status.staged_files && status.staged_files.length > 0 ? html`
            <div class="status-section staged">
              <h5>Staged Changes (${status.staged_files.length})</h5>
              <ul>
                ${status.staged_files.map(file => html`<li class="staged-file">📄 ${file}</li>`)}
              </ul>
            </div>
          ` : ''}
          
          ${status.modified_files && status.modified_files.length > 0 ? html`
            <div class="status-section modified">
              <h5>Modified Files (${status.modified_files.length})</h5>
              <ul>
                ${status.modified_files.map(file => html`<li class="modified-file">📝 ${file}</li>`)}
              </ul>
            </div>
          ` : ''}
          
          ${status.untracked_files && status.untracked_files.length > 0 ? html`
            <div class="status-section untracked">
              <h5>Untracked Files (${status.untracked_files.length})</h5>
              <ul>
                ${status.untracked_files.map(file => html`<li class="untracked-file">❓ ${file}</li>`)}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderRebaseMessage() {
    if (!this.view.rebaseCompleting || !this.view.rebaseMessage) return '';

    return html`
      <div class="rebase-message">
        <h4>Rebase Status</h4>
        <p>${this.view.rebaseMessage}</p>
        ${this.view.error ? html`
          <div class="rebase-error">
            <strong>Git says:</strong>
            <pre>${this.view.error}</pre>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderRebasePlan() {
    if (!this.view.rebaseMode || !this.view.rebasePlan.length) return '';

    return html`
      <div class="rebase-plan">
        <div class="rebase-plan-header">
          <h3>Interactive Rebase Plan</h3>
          <p>Drag to reorder commits, change actions, and edit messages:</p>
        </div>
        <div class="rebase-commits">
          ${this.view.rebasePlan.map((commit, index) => html`
            <div class="rebase-commit" draggable="true" 
                 @dragstart=${(e) => this.handleDragStart(e, index)}
                 @dragover=${this.handleDragOver}
                 @drop=${(e) => this.handleDrop(e, index)}>
              <select class="rebase-action" 
                      .value=${commit.action || 'pick'}
                      @change=${(e) => this.view.rebaseManager.updateRebaseAction(index, e.target.value)}>
                <option value="pick">pick</option>
                <option value="drop">drop</option>
                ${index > 0 ? html`<option value="squash">squash</option>` : ''}
                <option value="edit">edit</option>
              </select>
              <span class="commit-hash">${commit.hash?.substring(0, 7)}</span>
              <input class="commit-message" 
                     .value=${commit.message || ''}
                     @input=${(e) => this.view.rebaseManager.updateCommitMessage(index, e.target.value)}
                     placeholder="Commit message">
            </div>
          `)}
        </div>
      </div>
    `;
  }

  handleDragStart(e, index) {
    e.dataTransfer.setData('text/plain', index.toString());
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e, toIndex) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    this.view.rebaseManager.moveCommit(fromIndex, toIndex);
  }

  renderFileTabs() {
    if (this.view.gitEditorMode) {
      return html`
        <div class="file-tabs">
          <button class="file-tab active git-editor">
            📝 ${this.view.gitEditorFile?.file || 'Git Editor'}
          </button>
        </div>
      `;
    }

    if (!this.view.changedFiles || this.view.changedFiles.length === 0) return '';
    
    return html`
      <div class="file-tabs">
        ${this.view.changedFiles.map(file => html`
          <button 
            class="file-tab ${file === this.view.selectedFile ? 'active' : ''} ${this.view.conflictFiles.includes(file) ? 'conflict' : ''}"
            @click=${() => this.view.selectFile(file)}
          >
            ${file}
            ${this.view.conflictFiles.includes(file) ? html`<span class="conflict-indicator">⚠</span>` : ''}
          </button>
        `)}
      </div>
    `;
  }

  renderContent() {
    if (this.view.loading) {
      return html`<div class="loading">Loading file changes...</div>`;
    }
    
    if (this.view.error && !this.view.rebaseCompleting) {
      return html`<div class="error">${this.view.error}</div>`;
    }
    
    if (this.view.gitEditorMode) {
      return html`
        <div class="diff-content">
          ${this.renderGitEditorHelp()}
          ${this.renderGitStatus()}
          ${this.renderFileTabs()}
          <monaco-diff-editor
            .originalContent=${this.view.fromContent}
            .modifiedContent=${this.view.toContent}
            .language=${this.view.getLanguageFromFile(this.view.selectedFile)}
            theme="vs-dark"
            ?readOnly=${false}
            @content-changed=${(e) => this.view.handleContentChanged(e)}
            @save-file=${(e) => this.view.handleSaveFile(e)}
            @request-find-in-files=${(e) => this.view.handleFindInFiles(e)}
          ></monaco-diff-editor>
        </div>
      `;
    }
    
    if (this.view.rebaseCompleting) {
      return html`
        <div class="rebase-completing">
          <h3>🔄 Rebase Paused</h3>
          ${this.renderRebaseMessage()}
          ${this.renderGitStatus()}
          <p>The rebase is paused and waiting for your action. Use the buttons above to:</p>
          <ul>
            <li><strong>Continue Rebase</strong> - Continue with the rebase process</li>
            <li><strong>Commit Changes</strong> - Create a new commit with staged changes</li>
            <li><strong>Commit --amend</strong> - Amend the previous commit with staged changes</li>
            <li><strong>Abort Rebase</strong> - Cancel the rebase and return to original state</li>
          </ul>
        </div>
      `;
    }
    
    if (this.view.rebaseMode && !this.view.rebaseInProgress) {
      return this.renderRebasePlan();
    }
    
    if (!this.view.fromCommit || !this.view.toCommit) {
      return html`<div class="no-changes">Select commits to view changes</div>`;
    }
    
    if (this.view.changedFiles.length === 0) {
      return html`<div class="no-changes">No changes between selected commits</div>`;
    }
    
    return html`
      <div class="diff-content">
        ${this.renderConflictControls()}
        ${this.renderGitStatus()}
        ${this.renderFileTabs()}
        <monaco-diff-editor
          .originalContent=${this.view.fromContent}
          .modifiedContent=${this.view.toContent}
          .language=${this.view.getLanguageFromFile(this.view.selectedFile)}
          theme="vs-dark"
          ?readOnly=${this.view.gitHistoryMode && !this.view.hasConflicts && !this.view.gitEditorMode}
          @content-changed=${(e) => this.view.handleContentChanged(e)}
          @save-file=${(e) => this.view.handleSaveFile(e)}
          @request-find-in-files=${(e) => this.view.handleFindInFiles(e)}
        ></monaco-diff-editor>
      </div>
    `;
  }
}
