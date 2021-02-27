#!/usr/bin/env bash
# install all hooks

(
  set -e
  cd $(git rev-parse --show-toplevel)
  # pre-commit
  pre-commit install >/dev/null
  echo pre-commit hooks installed

  # post-merge
  cp scripts/build-docs-hook.sh .git/hooks/
  echo documentation hook installed
)
