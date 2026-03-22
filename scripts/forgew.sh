#!/usr/bin/env bash
set -euo pipefail

if [ -x "${HOME}/.foundry/bin/forge" ]; then
  exec "${HOME}/.foundry/bin/forge" "$@"
fi

exec forge "$@"
