#!/usr/bin/env node
// Thin launcher: the real CLI lives in the bundled dist/cli.js, which runs on
// import and sets process.exitCode.
import('../dist/cli.js').catch((error) => {
  console.error(error)
  process.exitCode = 1
})
