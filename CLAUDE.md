# Ignite Website

## Working Rules

- Do what has been asked; nothing more, nothing less
- Prefer editing an existing file to creating a new one
- Do not create documentation files (*.md) or README files unless explicitly requested
- Never commit secrets, credentials, or .env files
- Never hardcode API keys, secrets, or credentials in source files

## File Organization

- Do not save working files, notes, or tests to the root folder
- Use `/src` for source code files
- Use `/tests` for test files
- Use `/docs` for documentation and markdown files
- Use `/config` for configuration files
- Use `/scripts` for utility scripts

## Build & Test

```bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

- Run tests after making code changes
- Verify the build succeeds before committing
