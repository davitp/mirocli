import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";

const organizationViewCommand = createCommand('view')

organizationViewCommand
    .description('View the organization info')
    .action(asyncHandler(async (_, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const miroApi = getMiroApi(context, authContext);

        const org = await miroGuard(() => miroApi.enterpriseGetOrganization(context.organizationId))

        logger.just(org.body);
    }));

export default organizationViewCommand;
