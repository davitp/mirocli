import { createCommand } from 'commander';
import boardsListCommand from './list';

const boardsCommand = createCommand('boards');

boardsCommand.addCommand(boardsListCommand);

export default boardsCommand;