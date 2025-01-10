import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { logger } from "@/services/logger";
import { getSessionState } from "@/services/session-service";

const authStateCommand = createCommand('state')

authStateCommand
    .description('Checks the current session state')
    .action(asyncHandler(async (_, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
 
        const current = await getSessionState(context.name);

        if(!current){
            logger.warn('No authenticated sessions')
            return
        }

        if(current.expired){
            logger.warn(`The current session for user ${current.userId} is expired as of ${current.expiresAt.toLocaleString('en-US')}`)
            return
        }
        
        logger.success(`The session for user ${current.userId} is currently active and will expire at ${current.expiresAt.toLocaleString('en-US')}`)
    }));

export default authStateCommand;
