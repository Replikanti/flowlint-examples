import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

// We will try to resolve the core package path
// In CI, we will install it.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ROOT_DIR = process.cwd();

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getLocalRules() {
  const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
  return entries
    .filter(dirent => dirent.isDirectory() && /^R\d+/.test(dirent.name))
    .map(dirent => dirent.name);
}

// Helper to find where flowlint-core rules are located
// This is tricky without knowing exact structure inside node_modules
// We assume: node_modules/@replikanti/flowlint-core/dist/packages/review/rules/index.js (compiled)
// OR better: we fetch the raw source from GitHub in the workflow and pass the path.
const CORE_SRC_PATH = process.env.CORE_SRC_PATH || './flowlint-core-src';

async function main() {
  try {
    console.log('Starting AI Docs Sync...');
    
    // 1. Identify Rules in Core
    // We look for rule definitions in the source.
    // Assuming we have the source checked out at CORE_SRC_PATH
    const rulesDir = path.join(CORE_SRC_PATH, 'packages/review/rules');
    
    // Check if source exists
    try {
        await fs.access(rulesDir);
    } catch {
        console.error(`Core source not found at ${rulesDir}. Make sure to checkout flowlint-core.`);
        process.exit(1);
    }

    // 2. Identify Local Example Directories
    const localRules = await getLocalRules();
    console.log(`Local rules found: ${localRules.join(', ')}`);

    // 3. For each local rule, find corresponding code and update docs
    for (const rule of localRules) {
        const readmePath = path.join(ROOT_DIR, rule, 'README.md');
        let currentDocs = '';
        try {
            currentDocs = await fs.readFile(readmePath, 'utf-8');
        } catch {
            console.warn(`No README for ${rule}, skipping update.`);
            continue;
        }

        // Try to find the rule code. 
        // Heuristic: Look for files in rulesDir that mention the rule ID (e.g. "R1")
        // Since rules are often in index.ts or separate files, we might need to read index.ts
        const rulesIndex = await fs.readFile(path.join(rulesDir, 'index.ts'), 'utf-8');
        
        // Simple extraction: find the block defining the rule
        // This is a naive regex approach but might work for "R1", "R2" etc.
        // We look for `createNodeRule('R1', ...)` or `createHardcodedStringRule({ ruleId: 'R4' ...`
        
        // We capture a chunk of text around the rule ID to give context to AI
        const ruleRegex = new RegExp(`(createNodeRule|createHardcodedStringRule|function r\d+).*?['"]${rule}['"].*?(\n\s*\n|$)`, 'gs');
        const match = rulesIndex.match(ruleRegex);
        
        // Also look for separate functions like "function r7AlertLogEnforcement" if defined in index.ts
        // If the code is modularized, we might need to read imports. 
        // For now, assuming index.ts contains most definitions or we read the whole file if small enough.
        
        // Let's just pass the WHOLE rules/index.ts to AI if it's not huge, relying on its ability to find the relevant part.
        // It's about 18KB based on previous reads, which fits easily in context.
        
        const codeContext = rulesIndex; 

        console.log(`Updating docs for ${rule}...`);

        const prompt = `
You are an expert developer and technical writer working on FlowLint.
Your goal is to ensure the documentation for rule "${rule}" accurately reflects the implementation in the code.

Context:
- Rule ID: ${rule}
- Source Code (TypeScript):
\`\`\`typescript
${codeContext}
\`\`\`

- Current Documentation (Markdown):
\`\`\`markdown
${currentDocs}
\`\`\`

Instructions:
1. Locate the implementation of ${rule} in the provided Source Code.
2. Compare the logic (what it checks, valid/invalid cases) with the Current Documentation.
3. If the documentation is inaccurate or missing details about edge cases (e.g. specific node types, parameters), UPDATE it.
4. Improve the clarity, grammar, and "How to Fix" sections.
5. Do NOT change the Mermaid diagrams unless they contradict the code logic.
6. Return ONLY the updated Markdown content.
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-5.1-codex', 
            messages: [
                { role: 'system', content: 'You are a meticulous technical writer.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1
        });

        const newDocs = response.choices[0].message.content?.trim();
        
        // Remove markdown fences if AI added them
        const cleanDocs = newDocs?.replace(/^```markdown\n/, '').replace(/\n```$/, '');

        if (cleanDocs && cleanDocs !== currentDocs) {
            await fs.writeFile(readmePath, cleanDocs, 'utf-8');
            console.log(`Updated ${rule}/README.md`);
        } else {
            console.log(`No changes needed for ${rule}.`);
        }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();