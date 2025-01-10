import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { table } from "table";
import { ellipsis } from "@/services/text-utils";

const boardsListCommand = createCommand('list')

boardsListCommand
    .description('List audit logs in the organization according to the filter')
    .option('-q, --query <text>', 'Query to filter the boards')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const now = new Date();

        const query = options.query ?? null;

        const miroApi = getMiroApi(context, authContext);

        const result = await miroGuard(() => miroApi.getBoards({
            query,
            limit: "10"
        }))
    
        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            return
        }

        const header = ['Key', 'Name', 'Owner', 'Creator', 'Team', 'Description'];
        const rows = [header];

        result.body.data?.forEach(item => rows.push([
            item.id,
            ellipsis(item.name, 20),
            item.owner?.name ?? '',
            item.createdBy?.name ?? '',
            ellipsis(item.team?.name ?? '', 15),
            ellipsis(item.description, 20)
        ]))

        logger.just(table(rows, { 
            drawHorizontalLine: () => false, 
            drawVerticalLine: () => false 
        }));
    }));

export default boardsListCommand;
