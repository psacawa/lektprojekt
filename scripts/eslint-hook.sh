#!/usr/bin/env bash
committed_eslintable_files=$(git diff --cached --name-only | grep -E "\.[jt]sx?$")
(
  cd frontend
  $(npm bin)/eslint --fix 
)

# if any of the candidate files where changed, return error exit status
changed=0 
for file in $committed_eslintable_files; do
  echo $file
  diff "$file" <(git show HEAD:$file) && continue;
  echo $file changed by eslint --fix
  changed=1
done

exit $changed
