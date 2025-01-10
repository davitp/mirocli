import { createCommand } from 'commander';
import contentLogsListCommand from './list';

const contentLogsCommand = createCommand('content-logs').aliases(['cl', 'cls', 'bcl', 'bcls']);

contentLogsCommand.addCommand(contentLogsListCommand);

export default contentLogsCommand;