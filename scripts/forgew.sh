#!/usr/bin/env bash
set -euo pipefail

if [ -x "${HOME}/.foundry/bin/forge" ]; then
  exec "${HOME}/.foundry/bin/forge" "$@"
fi

if command -v forge >/dev/null 2>&1; then
  exec forge "$@"
fi

cat >&2 <<'EOF'
[forgew] forge binary not found.

Install Foundry, then rerun:
  curl -L https://foundry.paradigm.xyz | bash
  source ~/.bashrc   # or source ~/.zshrc
  foundryup

After install, verify:
  forge --version
EOF

exit 127
