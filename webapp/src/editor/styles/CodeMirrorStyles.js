import {css} from 'lit';

export const codeMirrorStyles = css`
  /* Ensure editors fill their containers */
  .cm-editor {
    height: 100% !important;
    flex: 1 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .cm-editor.cm-focused {
    outline: none !important;
  }

  /* Force scrollbars to be visible and contained */
  .cm-scroller {
    overflow: auto !important;
    height: 100% !important;
    max-height: 100% !important;
    flex: 1 !important;
    min-height: 0 !important;
  }

  /* Ensure content area is properly sized */
  .cm-content {
    min-height: 100% !important;
    padding: 4px 0 !important;
  }

  /* Gutter styling */
  .cm-gutters {
    flex-shrink: 0 !important;
  }

  .cm-gutter-lint {
    width: 8px;
  }

  .cm-diff-gutter-insert {
    background-color: #4ec9b0;
    width: 3px;
    margin-left: 2px;
  }

  .cm-diff-gutter-delete {
    background-color: #f44747;
    width: 3px;
    margin-left: 2px;
  }

  .cm-diff-gutter-change {
    background-color: #ffd700;
    width: 3px;
    margin-left: 2px;
  }

  /* VS Code-style merge controls */
  .cm-merge-revert {
    background: #0e639c;
    color: white;
    border: none;
    border-radius: 2px;
    padding: 2px 8px;
    margin: 0 4px;
    cursor: pointer;
    font-size: 11px;
  }

  .cm-merge-revert:hover {
    background: #1177bb;
  }

  /* Multi-cursor styling */
  .cm-cursor-primary {
    border-left-color: #fff !important;
  }

  .cm-cursor-secondary {
    border-left-color: #ff9b00 !important;
  }

  /* Highlight secondary selections */
  .cm-selectionBackground {
    background-color: rgba(173, 214, 255, 0.15) !important;
  }

  .cm-focused .cm-selectionBackground {
    background-color: rgba(173, 214, 255, 0.3) !important;
  }
`;
