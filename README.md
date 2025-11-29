# FlowLint Examples

This directory contains workflow examples for each FlowLint rule (R1-R12). Each rule has:

- **Bad examples** (❌) showing code that triggers the rule
- **Good examples** (✅) showing compliant patterns
- **Explanations** with Mermaid diagrams and best practices

---

## Directory Structure

```
flowlint-examples/
├── R1/                          # Rate Limit & Retry
│   ├── bad-example.json         # ❌ Missing retry configuration
│   ├── good-example.json        # ✅ Proper retry setup
│   └── README.md                # Explanation + diagrams
├── R2/                          # Error Handling
│   ├── bad-example.json
│   ├── good-example.json
│   └── README.md
├── R3/                          # Idempotency ⭐
│   ├── bad-example.json         # ❌ No idempotency guard
│   ├── good-example-with-eventId.json    # ✅ eventId strategy
│   ├── good-example-with-messageId.json  # ✅ messageId strategy
│   └── README.md                # Detailed explanation
├── R4/  through R12/            # Other rules (similar structure)
└── README.md                    # This file
```

---

## Quick Guide to Each Rule

### R1: Rate Limit & Retry 🔄
**Severity:** `must`
- API/HTTP nodes **must have retry/backoff** enabled
- Protects against rate limiting and transient failures
- [→ See R1 examples](./R1/README.md)

---

### R2: Error Handling ⚠️
**Severity:** `must`
- Forbids `continueOnFail=true`
- Errors must have explicit error branches
- [→ See R2 examples](./R2/README.md)

---

### R3: Idempotency 🔑
**Severity:** `must`
- Mutations must have idempotency guards (`eventId`, `messageId`)
- Prevents duplicate records on webhook retries
- **⭐ Best documented with detailed examples**
- [→ See R3 examples](./R3/README.md)

---

### R4: Secrets 🔐
**Severity:** `must`
- Detects hardcoded API keys, tokens, and credentials
- Must use `$credentials.*` or `$env.*`
- [→ See R4 examples](./R4/README.md)

---

### R5: Dead Ends 💀
**Severity:** `nit`
- Finds orphaned nodes with no outgoing connections
- Indicates incomplete workflow or unreachable code
- [→ See R5 examples](./R5/README.md)

---

### R6: Long Running ⏱️
**Severity:** `should`
- Warns about high iteration counts and timeouts
- Prevents workflows from stalling
- [→ See R6 examples](./R6/README.md)

---

### R7: Alert/Log Enforcement 📋
**Severity:** `should`
- Error branches must log or alert before rejoining main flow
- Ensures visibility into failures
- [→ See R7 examples](./R7/README.md)

---

### R8: Unused Data 🗑️
**Severity:** `nit`
- Detects data paths that never reach a consumer
- Indicates wasted processing
- [→ See R8 examples](./R8/README.md)

---

### R9: Config Literals 🔧
**Severity:** `should`
- Detects hardcoded environment strings (dev, prod, staging)
- Must use expressions or credentials
- [→ See R9 examples](./R9/README.md)

---

### R10: Naming Convention 📝
**Severity:** `nit`
- Forbids generic node names ("IF", "HTTP Request", "Set")
- Requires descriptive names for clarity
- [→ See R10 examples](./R10/README.md)

---

### R11: Deprecated Nodes 📦
**Severity:** `should`
- Warns about deprecated n8n node types
- Ensures workflows stay compatible with new versions
- [→ See R11 examples](./R11/README.md)

---

### R12: Unhandled Error Path ❌
**Severity:** `must`
- Error-prone nodes (API, mutations) must have error branches
- Ensures all failures are handled
- [→ See R12 examples](./R12/README.md)

---

## How to Use These Examples

### 1. View in n8n Editor

1. Open [n8n.io](https://n8n.io) or your local n8n instance
2. Create a new workflow
3. Import JSON from `bad-example.json` or `good-example-*.json`
4. Observe the workflow structure
5. Try running it to understand behavior

### 2. Test with FlowLint

Place these workflows in your repository:

```bash
cp flowlint-examples/R3/bad-example.json workflows/webhook-mutation-bad.json
cp flowlint-examples/R3/good-example-with-eventId.json workflows/webhook-mutation-good.json
```

Create a pull request → FlowLint will check them:
- `bad-example.json` → ❌ R3 violation
- `good-example-*.json` → ✅ PASS

### 3. Learn from Diagrams

Each rule's `README.md` includes:
- **Mermaid flow diagrams** showing good vs. bad patterns
- **Step-by-step explanations**
- **Configuration examples**
- **Testing strategies**

### 4. Customize for Your Team

Edit `.flowlint.yml` to adjust severities or enable/disable rules:

```yaml
rules:
  idempotency:
    enabled: true
    severity: must
    key_field_candidates:
      - eventId
      - messageId
      - transactionId  # Add custom keys
```

---

## Example Output Format

Each example file contains metadata describing its purpose:

```json
{
  "nodes": [ ... ],
  "connections": { ... },
  "meta": {
    "description": "❌ BAD: Webhook → Google Sheets without idempotency",
    "idempotency_strategy": "N/A - This is the bad example",
    "notes": [
      "If webhook fires twice, duplicates are created",
      "No unique key to prevent retries"
    ]
  }
}
```

---

## Support / Feedback

- Docs or examples in this public repo: open an issue here.
- Product/runtime bugs or feature requests: submit via [flowlint.dev/support](https://flowlint.dev/support) (tickets are routed to the private tracker).

## Best Practices Summary

### Before Mutations 🛡️
- ✅ Extract unique IDs from webhooks (`eventId`, `messageId`)
- ✅ Preserve IDs through transformations
- ✅ Enforce at database level (unique constraints, `ON CONFLICT`)

### Error Handling 🚨
- ✅ Always add error branches
- ✅ Log or alert on errors before rejoining
- ✅ Enable retry with exponential backoff

### Security 🔐
- ✅ Never hardcode secrets
- ✅ Use `$credentials.*` for API keys
- ✅ Move hardcoded URLs to `$env.*`

### Code Quality 📋
- ✅ Use descriptive node names
- ✅ Remove dead-end nodes
- ✅ Avoid generic names ("IF", "Set")

---

## Configuration Checklist

```yaml
# .flowlint.yml - Complete Configuration
files:
  include:
    - "**/*.n8n.json"
    - "**/workflows/*.json"
  ignore:
    - "samples/**"
    - "node_modules/**"

report:
  annotations: true
  summary_limit: 25

rules:
  rate_limit_retry:
    enabled: true
  error_handling:
    enabled: true
    forbid_continue_on_fail: true
  idempotency:
    enabled: true
    key_field_candidates:
      - eventId
      - messageId
  secrets:
    enabled: true
  dead_ends:
    enabled: true
  long_running:
    enabled: true
    max_iterations: 1000
  unused_data:
    enabled: true
  unhandled_error_path:
    enabled: true
  alert_log_enforcement:
    enabled: true
  deprecated_nodes:
    enabled: true
  naming_convention:
    enabled: true
  config_literals:
    enabled: true
```

---

## Running Tests

To test these examples against FlowLint rules:

```bash
# From flowlint-app root
npm test -- tests/workflows.spec.ts

# Run a specific rule test
npm test -- tests/workflows.spec.ts --reporter=verbose
```

---

## Contributing New Examples

When adding a new rule example:

1. Create the rule directory: `R<N>/`
2. Add files:
   - `bad-example.json` (❌ fails the rule)
   - `good-example.json` (✅ passes the rule)
   - `README.md` with:
     - Overview of the rule
     - Why the bad example fails (with FlowLint output)
     - Why good examples pass
     - Mermaid diagram
     - Best practices
     - Configuration options

3. Example template:

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "n8n-nodes-base.webhook",
      "name": "Trigger",
      "parameters": {}
    }
  ],
  "connections": {},
  "meta": {
    "description": "Your description here",
    "rule": "R<N>",
    "severity": "must|should|nit",
    "notes": ["Point 1", "Point 2"]
  }
}
```

---

## More Information

- **FlowLint Rules:** See `../RULES.md`
- **Architecture:** See `../AGENTS.md`
- **Configuration:** See `../CLAUDE.md`

---

## Support

If you have questions about these examples:
1. Check the rule's `README.md` for detailed explanations
2. Review the n8n documentation: https://docs.n8n.io/
3. Docs/examples feedback: open an issue in this repo.
4. Product/runtime bugs or feature requests: submit via https://flowlint.dev/support (tickets go to the private tracker).

---

**Last Updated:** 11/2025
**FlowLint Version:** ≥ 0.3.0
