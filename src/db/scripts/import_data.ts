import { dbClient_ext as db, queryClient } from './client';
import { writeFile } from 'fs/promises';
import { dbMode, make_dir, take_input } from '~/tools/kry.server';

const main = async () => {
  if (!(await confirm_environemnt())) return;

  console.log(`Fetching Data from ${dbMode} Database...`);

  const user = await db.query.user.findMany();
  const account = await db.query.account.findMany();
  const verification = await db.query.verification.findMany();
  const user_info = await db.query.user_info.findMany();
  const project = await db.query.project.findMany();
  const language = await db.query.language.findMany();
  const user_project_join = await db.query.user_project_join.findMany();
  const user_project_language_join = await db.query.user_project_language_join.findMany();

  const json_data = {
    user,
    account,
    verification,
    user_info,
    project,
    language,
    user_project_join,
    user_project_language_join
  };

  await make_dir('./out');
  const out_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];
  await writeFile(`./out/${out_file_name}`, JSON.stringify(json_data, null, 2));
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure SELECT from ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
