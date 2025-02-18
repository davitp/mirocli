import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import chalk from "chalk";

const organizationViewCommand = createCommand('view')

organizationViewCommand
    .description('View the organization info')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const miroApi = getMiroApi(context, authContext);

        const org = await miroGuard(() => miroApi.enterpriseGetOrganization(context.organizationId))

        if(options.json){
            logger.just(JSON.stringify(org.body, null, 4))
            return
        }

        logger.just(chalk.bold('Current organization:'))
        logger.just(` - ${chalk.bold('Id: ')} ${org.body.id}`)
        logger.just(` - ${chalk.bold('Name: ')} ${org.body.name}`)
        logger.just(` - ${chalk.bold('Plan: ')} ${org.body.plan}`)
        logger.just(` - ${chalk.bold('Type: ')} ${org.body.type}`)
        logger.just(` - ${chalk.bold('Licenses: ')} ${org.body.fullLicensesPurchased}`)
    }));

export default organizationViewCommand;
