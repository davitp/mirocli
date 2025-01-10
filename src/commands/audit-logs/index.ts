import { createCommand } from 'commander';
import auditLogsListCommand from './list';

const auditLogsCommand = createCommand('audit-logs').aliases(['al', 'als']);

auditLogsCommand.addCommand(auditLogsListCommand);

export default auditLogsCommand;