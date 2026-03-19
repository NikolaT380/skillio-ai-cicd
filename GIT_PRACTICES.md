# Git Best Practices and Workflow

This guide outlines the standard Git workflow and best practices for all contributors to the AI Recruitment System project.

## 1. Branching Strategy

We use a **Feature Branching** workflow.
All feature branches should be from the `develop` branch

- `main`: The stable production-ready code. No one should commit directly to `main`.
- `develop`: The integration branch for features.
- `feature/short-description`: For new features (e.g., `feature/cv-parser`, `feature/admin-dashboard`).
- `bugfix/issue-description`: For bug fixes (e.g., `bugfix/fix-auth-leak`).

### Workflow Steps:
1.  **Sync your local main/develop**: `git checkout develop && git pull origin develop`
2.  **Create a new branch**: `git checkout -b feature/your-feature-name`
3.  **Work and Commit**: Make small, logical commits.
4.  **Push your branch**: `git push -u origin feature/your-feature-name`
5.  **Open a Pull Request (PR)**: Target the `develop` branch.
6.  **Code Review**: At least one other team member must approve the PR.
7.  **Merge**: Once approved, merge using "Squash and Merge" to keep history clean.

## 2. Commit Message Convention

**Common Types:**
- `[FTR]`: A new feature.
- `[FIX]`: A bug fix.
- `[DOCS]`: Documentation only changes.
- `[REFACTOR]`: A code change that neither fixes a bug nor adds a feature.

**Examples:**
- `[FTR] add pgvector similarity search service`
- `[FIX] resolve memory leak in dashboard chart`
- `[DOCS] update git best practices`

## 3. Pull Request Guidelines

- **Title**: Use Conventional Commit format for the PR title.
- **Description**: Briefly explain *what* changed and *why*.
- **Task List**: Use checkboxes for sub-tasks.
- **Linked Issues**: Reference any Jira/GitHub issues (e.g., `Closes #123`).

## 4. Resolving Conflicts

Never merge `develop` into your feature branch. Always **rebase** to keep a linear history:
```bash
git checkout feature/your-branch
git fetch origin
git rebase origin/develop
# Fix conflicts if any, then:
git add .
git rebase --continue
git push --force-with-lease  # Required after rebase
```

## 5. Security and Cleanliness

- **NEVER commit secrets**: Do not commit `.env`, API keys, or certificates.
- **Check `.gitignore`**: Ensure your OS-specific files (like `.DS_Store` or `__pycache__/`) are ignored.

## 6. Useful Commands

- `git status`: Check current changes.
- `git diff`: See line-by-line changes.
- `git log --oneline --graph --all`: View a beautiful tree of your history.
- `git checkout -`: Switch back to the previous branch.
- `git remote -v`: Check your remote origins.

---
*Following these practices ensures a stable, readable, and professional codebase for the public administration project.*
