import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { table } from "table";

const teamsListCommand = createCommand('list')

teamsListCommand
    .description('View the teams within the organization')
    .option('-n, --name <text>', 'The name to filter with')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const miroApi = getMiroApi(context, authContext);

        const name = options.name ?? null;

        const result = await miroGuard(() => miroApi.enterpriseGetTeams(context.organizationId, { name }))

        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            return
        }

        const header = ['Id', 'Type', 'Name'];
        const rows = [header];

        result.body.data.forEach(item => rows.push([item.id, item.type ?? '', item.name]))

        logger.just(table(rows, { 
            drawHorizontalLine: () => false, 
            drawVerticalLine: () => false 
        }));
    }));

export default teamsListCommand;
