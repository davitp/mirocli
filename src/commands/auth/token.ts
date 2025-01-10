import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import chalk from "chalk";

const authTokenCommand = createCommand('token')

authTokenCommand
    .description('Show the token of current authenticated user')
    .action(asyncHandler(async (_, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        logger.warn('Do not share your access token anywhere else')
        logger.just(`${chalk.bold(' - Access Token:')} ${authContext.accessToken}`)
        logger.just(`${chalk.bold(' - Expires At:')} ${authContext.expiresAt.toLocaleString('en-GB')}`)
    }));

export default authTokenCommand;
