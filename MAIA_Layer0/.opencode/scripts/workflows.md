# .github/workflows/quality.yml
# Quality gates pipeline

jobs:
  quality-check:
    steps:
      # Runs typecheck, lint, tests, and build
      # Updates agent metrics based on commits
  security-scan:
    steps:
      # Runs npm audit and Snyk security scan
