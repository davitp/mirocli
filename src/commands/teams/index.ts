import { createCommand } from 'commander';
import teamsListCommand from './list';

const teamsCommand = createCommand('teams');

teamsCommand.addCommand(teamsListCommand);

export default teamsCommand;