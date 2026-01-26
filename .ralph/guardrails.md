# Guardrails - FlowLint Examples

## Rules

### G1: Never commit to main
- **Trigger:** `git commit` on main branch
- **Instruction:** Create feature branch
- **Discovered:** Iteration 0

### G2: Validate examples
- **Trigger:** Adding/modifying examples
- **Instruction:** Run flowlint-cli on examples to verify
- **Discovered:** Iteration 0
