import { createCommand } from 'commander';
import authLoginCommand from './login';
import authStateCommand from './state';
import authInfoCommand from './info';
import authWhoamiCommand from './whoami';
import authTokenCommand from './token';

const authCommands = createCommand('auth');

authCommands.addCommand(authLoginCommand);
authCommands.addCommand(authStateCommand);
authCommands.addCommand(authInfoCommand);
authCommands.addCommand(authWhoamiCommand);
authCommands.addCommand(authTokenCommand);

export default authCommands;