#!/usr/bin/env bash

changed=0
for f in $(git diff --name-only --diff-filter=AMD HEAD HEAD^ | grep "\.rst$"); do
  echo Documentation source changed: $f
  changed=1
done
echo

if [[ $changed == 1 ]]; then
  echo
  echo Rebuilding documentation...
  (
    cd backend
    python3 manage.py build_docs
  )
fi
