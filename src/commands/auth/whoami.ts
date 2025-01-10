import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import chalk from "chalk";

const authWhoamiCommand = createCommand('whoami')

authWhoamiCommand
    .description('Display the authenticated users information')
    .action(asyncHandler(async (_, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const miroApi = getMiroApi(context, authContext);

        const { body: { user, team, organization, createdBy, scopes }} = await miroGuard(() => miroApi.tokenInfo());
        
        logger.just(chalk.bold('Current user details:'))
        logger.just(` - ${chalk.bold('Organization: ')} ${organization.name} (${organization.id})`)
        logger.just(` - ${chalk.bold('User: ')} ${user.name} (${user.id})`)
        logger.just(` - ${chalk.bold('Team: ')} ${team.name} (${team.id})`)
        logger.just(` - ${chalk.bold('Created By: ')} ${createdBy.name} (${createdBy.id})`)
        logger.just(` - ${chalk.bold('Scopes: ')} ${scopes?.join(', ')}`)

    }));

export default authWhoamiCommand;
