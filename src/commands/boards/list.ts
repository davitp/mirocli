import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { table } from "table";
import { ellipsis } from "@/services/text-utils";
import chalk from "chalk";

const boardsListCommand = createCommand('list')

boardsListCommand
    .description('List audit logs in the organization according to the filter')
    .option('-q, --query <text>', 'Query to filter the boards')
    .option('--team <text>', 'Filter boards by team')
    .option('--project <text>', 'Filter boards by project')
    .option('--owner <text>', 'Filter boards by owner')
    .option('--limit <number>', 'The number of requested items', '10')
    .option('--offset <number>', 'The offset of items for iteration', '0')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const now = new Date();

        const query = options.query ? options.query : undefined;
        const teamId = options.team ? options.team : undefined;
        const projectId = options.project ? options.project : undefined;
        const owner = options.owner ? options.owner : undefined;
        const limit = options.limit ?? 10;
        const offset = options.offset ? options.offset : 0;

        const miroApi = getMiroApi(context, authContext);

        const result = await miroGuard(() => miroApi.getBoards({
            query,
            teamId,
            projectId,
            owner,
            limit,
            offset
        }))

        const keepGoing = (result.body.total ?? 0) > (result.body.data?.length ?? 0);
        const cursorMessage = `To continue iterating just append ${chalk.bold(`--offset '${(result.body.offset ?? 0) + (result.body.size ?? 0)}'`)} to you command`

        const iterate = () => keepGoing ? logger.info(`\n${cursorMessage}`) : false;
    
        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            iterate()
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

        iterate()
    }));

export default boardsListCommand;
