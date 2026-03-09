# R15: Error Handler Set in Settings

## Overview

**Rule:** R15 – Error Handler Set in Settings
**Severity:** `must`
**Purpose:** Ensure main workflows have a global error workflow configured.

**FlowLint check (how R15 detects violations):**
- Checks if the workflow contains trigger nodes (Webhook, Schedule, Form, etc.).
- If it's a main workflow, verifies that `settings.errorWorkflow` is present and valid.
- Sub-workflows (e.g., using Execute Workflow Trigger) are excluded from this requirement.

**Why it matters:** 
If an uncaught error occurs in a workflow and no error workflow is configured, the execution fails silently or without notifying the relevant system administrators. Setting a global error handler ensures you always receive alerts for failing executions.

---

## 🔧 How to Fix R15 in n8n

1. Go to **Workflow Settings**.
2. Find the **Error Workflow** dropdown.
3. Select an existing error handler workflow.

---

## Example 1: ❌ BAD – No Error Workflow Configured

File: `bad-example.json`

**FlowLint output:**
```
❌ R15 (must): Main workflow does not have an error handler workflow configured in settings
```

## Example 2: ✅ GOOD – Error Workflow Configured

File: `good-example.json`

**Why this passes:**
- The workflow has `settings.errorWorkflow` set to the ID of a valid error handling workflow.

---

## Test This Rule

1. **Install FlowLint CLI:**
   ```bash
   npm install -g flowlint
   ```

2. **Scan bad example (should fail):**
   ```bash
   flowlint scan R15/bad-example.json
   ```

3. **Scan good example (should pass):**
   ```bash
   flowlint scan R15/good-example.json
   ```
