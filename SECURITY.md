# Security Policy

This project is a small static web app: form data is processed entirely in
the browser, and the generated PDF is created and downloaded client-side.
There is no backend and no server-side storage of any form data.

## Reporting a Vulnerability

If you find a security issue (for example, a way for form data to leak
outside the browser, or a dependency vulnerability), please open a
[GitHub Security Advisory](../../security/advisories/new) for this repository
rather than a public issue. This lets us assess and fix the problem before
details are public.

## Scope

Given the app has no backend, most concerns will be about the frontend build
(e.g. a compromised dependency) rather than a live API or database.
Dependabot and GitHub code scanning are enabled on this repository to catch
known-vulnerable dependencies and common code issues automatically.
