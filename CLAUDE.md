# CLAUDE.md

## Project
Capstone project repo

## Stack
- HTML, CSS, JavaScript (no framework yet)
- Node.js (LTS) installed, not yet used in the project itself
- Git for version control

## Conventions
- Commit messages follow Conventional Commits (e.g. feat:, fix:, docs:, chore:)
- Keep commits small and focused

## Rules Learned

> (FE-03)

1. Always specify the exact file path/folder for Claude to save new files
   into,otherwise it may save them to its own default working directory
   instead of this project folder.

2. Vague prompts can leaad to misinterpretation of the basic concept of a
   field or feature, not just its styling.Therefore, always name fields and their
   exact purpose explicitly.

3. Behavior that isn't explicitly requested (e.g. responsive/resizable layout) will not be included by default.
   So,always list expected behavior explicitly rather than assuming it's implied.

