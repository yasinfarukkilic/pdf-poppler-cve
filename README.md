# CVE Report: Argument Injection in pdf-poppler

Security vulnerability report for the npm package `pdf-poppler`.

## Summary

The `pdf-poppler` npm package (all versions through 0.2.1) is vulnerable to **Argument Injection** (CWE-88). File paths are passed to poppler CLI tools without a `--` end-of-options separator, allowing filenames starting with `-` to be interpreted as command flags.

Additionally, the package bundles poppler 0.51.0 (2017) with multiple known CVEs including heap buffer overflows.

## Details

See [VULNERABILITY-REPORT.md](VULNERABILITY-REPORT.md) for the full report.

## Status

- **GHSA:** Pending
- **MITRE:** Pending
- **Discovered by:** Yasin Faruk ([@yasinfarukkilic](https://github.com/yasinfarukkilic))
- **Date:** 2026-11-05
