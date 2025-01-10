import { createCommand } from 'commander';
import contextAddCommand from './add';

const contextCommands = createCommand('contexts').aliases(['ctx', 'context']);

contextCommands.addCommand(contextAddCommand);

export default contextCommands;