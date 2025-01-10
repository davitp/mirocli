import { createCommand } from 'commander';
import organizationViewCommand from './view';

const organizationCommands = createCommand('organization');

organizationCommands.alias('org');

organizationCommands.addCommand(organizationViewCommand);

export default organizationCommands;