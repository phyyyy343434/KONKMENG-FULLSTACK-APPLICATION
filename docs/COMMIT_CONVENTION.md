# Commit Naming Convention - KONKMENG

## Standard Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or tooling
- **ci**: Changes to CI/CD configuration

## Scopes

- **ui**: User interface changes
- **api**: API/backend changes
- **auth**: Authentication related
- **pricing**: Pricing section
- **blog**: Blog section
- **languages**: Language support
- **favicon**: Favicon/branding
- **docs**: Documentation
- **config**: Configuration files

## Examples

### Good ✅
```
feat(ui): add 15 language support to code editor
fix(api): resolve CORS issue with Render deployment
docs(readme): update installation instructions
chore(deps): update dependencies to latest versions
perf(api): optimize code analysis response time
```

### Bad ❌
```
🔧 Fix ALL text visibility in dark mode - HIGH CONTRAST
🚨 URGENT: Fix Khmer language + Clean API key references
✨ Add markdown formatting and corrected code box
```

## Rules

1. Use lowercase for type and scope
2. No period at the end of subject
3. Subject should be imperative (add, fix, update, not added, fixed, updated)
4. Keep subject under 50 characters
5. No emojis in commit messages
6. Reference issues if applicable: `fix(api): resolve CORS issue (#123)`

## Current Status

The repository has mixed conventions. New commits should follow this standard.

## Migration Plan

For future commits, use the standard format above. Old commits can remain as-is for historical purposes.
