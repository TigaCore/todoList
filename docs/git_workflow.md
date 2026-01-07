# Git Version Control Strategy & Workflow

This document outlines the version control standards for the **Tiga** project. We adopt a simplified **Git Flow** model to ensure code stability while maintaining agility.

## 1. Branching Model

We use the following persistent and temporary branches:

### Core Branches
| Branch Name | Description | Protection Rules |
| :--- | :--- | :--- |
| `main` | **Production-ready code.** Contains the official release history. | 🔒 Protected (No direct push) |
| `develop` | **Integration branch.** The default branch for daily development. Contains the latest delivered features for the next release. | 🔒 Protected (Requires PR) |

### Temporary Branches
| Prefix | Source | Merge Target | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `feature/` | `develop` | `develop` | Developing new features or enhancements. | `feature/mobile-date-picker` |
| `bugfix/` | `develop` | `develop` | Fixing non-critical bugs found during development. | `bugfix/login-error-msg` |
| `release/` | `develop` | `main`, `develop` | Preparing for a new production release (v1.0, v1.1). Documentation & minor bug fixes only. | `release/v1.0.0` |
| `hotfix/` | `main` | `main`, `develop` | Critical fixes for the production version. | `hotfix/critical-crash` |

---

## 2. Development Workflow

### Step 1: Feature Development
1.  **Start**: Create a branch from `develop`.
    ```bash
    git checkout develop
    git pull
    git checkout -b feature/my-new-feature
    ```
2.  **Work**: Commit changes regularly.
3.  **Finish**: Push to origin and create a **Pull Request (PR)** to `develop`.
    *   *Review required before merging.*

### Step 2: Release Process
When `develop` has accumulated enough features for a release (e.g., v1.0.0):

1.  **Create Release Branch**:
    ```bash
    git checkout develop
    git checkout -b release/v1.0.0
    ```
    *From this point, no new features are added to this release. Only bug fixes, documentation, and other release-oriented tasks.*

2.  **Testing & Polish**: Deploy to a staging environment (if available) or run thorough local tests. Fix bugs directly on this branch.

3.  **Finalize Release**:
    *   Merge `release/v1.0.0` into `main`.
    *   Tag the release in `main`:
        ```bash
        git checkout main
        git tag -a v1.0.0 -m "Release v1.0.0"
        git push origin main --tags
        ```
    *   Merge `release/v1.0.0` back into `develop` (to ensure `develop` has the latest fixes).
    *   Delete the release branch.

### Step 3: Hotfixes (Production Issues)
If a critical bug is found in `main` (production):

1.  **Start**: Create a branch from `main`.
    ```bash
    git checkout -b hotfix/v1.0.1
    ```
2.  **Fix**: Commit the fix.
3.  **Finish**:
    *   Merge into `main` and tag (v1.0.1).
    *   Merge into `develop`.

---

## 3. Commit Message Conventions (Conventional Commits)
We follow the **Conventional Commits** specification to create a readable history and automate versioning/changelogs.

**Format**: `<type>(<scope>): <subject>`

### Types
*   **feat**: A new feature
*   **fix**: A bug fix
*   **docs**: Documentation only changes
*   **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   **refactor**: A code change that neither fixes a bug nor adds a feature
*   **perf**: A code change that improves performance
*   **chore**: Changes to the build process or auxiliary tools

### Examples
*   `feat(auth): implement glassmorphism login page`
*   `fix(sidebar): resolve mobile drawer z-index issue`
*   `docs(readme): add setup instructions`
*   `refactor(editor): switch to lightweight markdown component`

---

## 4. Best Practices
1.  **Squash Merges**: When merging PRs, squash commits to keep the main history clean.
2.  **Keep Branches Short-Lived**: Merge feature branches often to avoid "merge hell".
3.  **Sync Often**: Run `git pull origin develop` frequently in your feature branch.
