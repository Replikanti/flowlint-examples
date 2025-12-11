
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ROOT_DIR = process.cwd();

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getRuleDirectories() {
  const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
  return entries
    .filter(dirent => dirent.isDirectory() && /^R\d+/.test(dirent.name))
    .map(dirent => dirent.name);
}

async function main() {
  try {
    // 1. Get Core Changelog (passed as env var or argument, mostly likely from the PR body that triggered this)
    // For simplicity in this v1, we will assume the script is run in a context where we want to "audit" docs against a provided context string.
    // However, getting the specific core change is hard. 
    
    // Alternative approach: "Audit Mode". The AI reads the README.md and looks for obvious outdated info or generic improvements.
    // BUT the user asked to "smartly document rules".
    
    // Let's make it simple: Iterate all R-folders, read README.md, and improve clarity/grammar using AI.
    // Real "update based on code changes" requires access to code.
    
    // ADJUSTMENT based on user request "update roadmap ... and document rules smartly":
    // I will write a script that iterates all rules, and for each, it generates a "Better Explanation" suggestion.
    
    console.log('Scanning rule directories...');
    const rules = await getRuleDirectories();
    console.log(`Found ${rules.length} rules: ${rules.join(', ')}`);

    for (const rule of rules) {
      const readmePath = path.join(ROOT_DIR, rule, 'README.md');
      
      try {
        const content = await fs.readFile(readmePath, 'utf-8');
        
        console.log(`Auditing ${rule}...`);
        
        const prompt = `
You are a Technical Writer for FlowLint (n8n workflow linter).
Your task is to improve the documentation for rule "${rule}".

Current README.md content:
"""
${content}
"""

Instructions:
1. Fix any grammar or spelling mistakes.
2. Improve clarity and structure.
3. Ensure it explains "Why it matters" and "How to fix".
4. Keep the mermaid diagrams as they are (do not modify mermaid code blocks unless syntax is broken).
5. Return ONLY the updated Markdown content.
`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert technical writer.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
        });

        const newContent = response.choices[0].message.content?.trim();

        if (newContent && newContent !== content) {
           await fs.writeFile(readmePath, newContent, 'utf-8');
           console.log(`Updated ${rule}/README.md`);
        } else {
           console.log(`No changes needed for ${rule}`);
        }

      } catch (err) {
        console.warn(`Skipping ${rule}: README not found or error.`);
      }
    }

  } catch (error) {
    console.error('Error updating docs:', error);
    process.exit(1);
  }
}

main();
