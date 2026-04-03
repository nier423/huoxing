import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readEnvFile(filePath: string) {
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );
}

const env = readEnvFile(resolve(process.cwd(), '.env.local'));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: testIssues, error: fetchTestIssuesError } = await supabase
    .from('issues')
    .select('id, slug')
    .in('slug', ['v4']);

  if (fetchTestIssuesError) {
    console.error("Error loading test issues:", fetchTestIssuesError);
    process.exit(1);
  }

  const testIssueIds = (testIssues ?? []).map((issue) => issue.id);

  if (testIssueIds.length > 0) {
    console.log("Deleting articles linked to v4...");
    const { error: deleteArticlesError } = await supabase
      .from('articles')
      .delete()
      .in('issue_id', testIssueIds);

    if (deleteArticlesError) {
      console.error("Error deleting articles for v4:", deleteArticlesError);
      process.exit(1);
    }
  }

  console.log("Deleting v4...");
  const { error: err1 } = await supabase.from('issues').delete().in('slug', ['v4']);
  if (err1) {
    console.error("Error deleting v4:", err1);
  } else {
    console.log("Successfully deleted v4.");
  }

  console.log("Updating v3 to V3...");
  const { error: err2 } = await supabase.from('issues').update({ label: 'V3' }).eq('slug', 'v3');
  if (err2) {
    console.error("Error updating v3:", err2);
  } else {
    console.log("Successfully updated label for v3 to V3.");
  }
}

main().catch(console.error);
