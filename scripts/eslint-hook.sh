#!/usr/bin/env bash
# precommit can run eslint --fix on js, ts files in the indexa nd rejected the commit if 
# that changed them

cd frontend
committed_eslintable_files=$(git diff --cached --name-only --relative | grep -E "\.[jt]sx?$")
declare -A files_before_lint
for file in $committed_eslintable_files; do
  files_before_lint[$file]="$(cat $file)"
done

$(npm bin)/eslint --fix  $committed_eslintable_files

# if any of the candidate files where changed, return error exit status
changed=0 
for file in $committed_eslintable_files; do
  diff <(echo "${files_before_lint[$file]}") $file && continue;
  echo $file changed by eslint --fix
  changed=1
done

exit $changed
