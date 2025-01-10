import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { authorize } from "@/services/authorize";
import { logger } from "@/services/logger";
import { storeSession } from "@/services/session-service";

const authLoginCommand = createCommand('login')

authLoginCommand
    .description('Login to interact with Miro API')
    .action(asyncHandler(async (_, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
 
        const result = await authorize(context);

        await storeSession(context.name, { 
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
            userId: result.userId
        });

        logger.success(`You have successfully authenticated as user ${result.userId}`);
    }));

export default authLoginCommand;
