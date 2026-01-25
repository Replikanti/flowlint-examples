# FlowLint Examples Development Skill

## Metadata
- **Name:** flowlint-examples-curator
- **License:** MIT
- **Compatibility:** Claude Code

## Description

Test workflows and rule demonstrations. Contains pass/fail examples for each rule (R1-R14).

## Capabilities

- **add-example:** Add new workflow example
- **validate:** Verify example correctness
- **document:** Document edge cases

## Project Structure

```
flowlint-examples/
├── R1/
│   ├── pass.n8n.json    # Correct workflow
│   ├── fail.n8n.json    # Problematic workflow
│   └── README.md        # Rule documentation
├── R2/
└── ... (R3-R14)
```

## Example Structure

Each rule directory contains:
- `pass.n8n.json` - Workflow that passes the rule
- `fail.n8n.json` - Workflow that violates the rule
- `README.md` - Rule explanation and examples

## Related Files

- `README.md` - Examples overview
