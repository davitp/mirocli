import { createCommand } from "commander";
import { asyncHandler } from "@/commands/common";
import { getCallbackUrl } from "@/services/authorize";
import { logger } from "@/services/logger";

const authInfoCommand = createCommand('info')

authInfoCommand
    .description('The info for authentication setup')
    .action(asyncHandler(async (_, cmd) => {

        logger.just(`Please use the following URL as 'Redirect URI for OAuth2.0' in Application Settings`);
        logger.info(`\t - ${getCallbackUrl()}`)

    }));

export default authInfoCommand;
