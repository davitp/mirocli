import { createCommand } from 'commander';
import boardExportSubmitCommand from './submit';
import boardExportResultCommand from './result';
import boardExportStatusCommand from './status';

const boardExportCommand = createCommand('board-export').aliases(['be', 'bes']);

boardExportCommand.addCommand(boardExportSubmitCommand);
boardExportCommand.addCommand(boardExportResultCommand);
boardExportCommand.addCommand(boardExportStatusCommand);

export default boardExportCommand;