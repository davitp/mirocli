import { version, name } from '../../package.json';
import { createCommand } from 'commander';
import contextCommands from './contexts';
import authCommands from './auth';
import organizationCommands from './organization';
import teamsCommand from './teams';
import contentLogsCommand from './content-logs';
import auditLogsCommand from './audit-logs';
import boardsCommand from './boards';

const program = createCommand();

program
  .name(name)
  .description('A lightweight and secure CLI tool for using Miro API')
  .version(version, '-v, --version')
  .option('-c, --context <context>', 'Use the context for interaction')
  .enablePositionalOptions();

program.addCommand(contextCommands);
program.addCommand(authCommands);
program.addCommand(organizationCommands);
program.addCommand(teamsCommand);
program.addCommand(contentLogsCommand);
program.addCommand(auditLogsCommand);
program.addCommand(boardsCommand);

export default program;

