import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { table } from "table";
import chalk from "chalk";

const teamsListCommand = createCommand('list')

teamsListCommand
    .description('View the teams within the organization')
    .option('-n, --name <text>', 'The name to filter with')
    .option('--limit <number>', 'The number of requested items', '10')
    .option('--cursor <string>', 'The cursor to continue iterating', '')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {
        
        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const miroApi = getMiroApi(context, authContext);

        const name = options.name ? options.name : undefined;
        const limit = options.limit ?? 10;
        const cursor = options.cursor ? options.cursor : undefined;

        const result = await miroGuard(() => miroApi.enterpriseGetTeams(context.organizationId, { 
            limit,
            cursor,
            name
        }))

        const keepGoing = result.body.cursor && result.body.size === result.body.limit;
        const cursorMessage = `To continue iterating just append ${chalk.bold(`--cursor '${result.body.cursor}'`)} to you command`

        const iterate = () => keepGoing ? logger.info(`\n${cursorMessage}`) : false;

        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            iterate()
            return
        }

        const header = ['Id', 'Type', 'Name'];
        const rows = [header];

        result.body.data.forEach(item => rows.push([item.id, item.type ?? '', item.name]))

        logger.just(table(rows, { 
            drawHorizontalLine: () => false, 
            drawVerticalLine: () => false 
        }));

        iterate()
    }));

export default teamsListCommand;
