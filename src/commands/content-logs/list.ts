import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { parseDateTime } from "@/services/date-time-parser";
import { subMinutes } from "date-fns";
import { table } from "table";
import chalk from "chalk";

const contentLogsListCommand = createCommand('list')

contentLogsListCommand
    .description('List content logs in the organization according to the filter')
    .option('-f, --from <date>', 'The start time of the logs')
    .option('-t, --to <date>', 'The end time of the logs')
    .option('--emails <text...>', 'Email addresses to filter')
    .option('--boards <text...>', 'Board keys to filder')
    .option('--limit <number>', 'The number of requested items', '10')
    .option('--cursor <string>', 'The cursor to continue iterating', '')
    .option('--asc', 'Sort in ascending order')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const now = new Date();

        const from = options.from ? parseDateTime(options.from) : subMinutes(now, 7);
        const to = options.to ? parseDateTime(options.to, now) : now;
        const limit = options.limit ?? 10;
        const cursor = options.cursor ? options.cursor : undefined;
        const sorting = options.asc ? 'asc' : 'desc';

        const miroApi = getMiroApi(context, authContext);
        
        const result = await miroGuard(() => miroApi.enterpriseBoardContentItemLogsFetch(
            context.organizationId,
            from, 
            to,
            {
                boardIds: options.boards ?? [],
                emails: options.emails ?? [],
                limit,
                cursor,
                sorting
            }
        ))

        const keepGoing = result.body.cursor && result.body.size === result.body.limit;
        const cursorMessage = `To continue iterating just append ${chalk.bold(`--cursor '${result.body.cursor}'`)} to you command`

        const iterate = () => keepGoing ? logger.info(`\n${cursorMessage}`) : false;

        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            iterate()
            return
        }

        const header = ['Content Id', 'Action', 'Actor', 'Item', 'Time'];
        const rows = [header];

        result.body.data?.forEach(item => rows.push([
            item.contentId ?? '',
            item.actionType ?? '',
            `${item.actor?.name} (${item.actor?.email})`,
            `${item.itemId} (${item.itemType})`,
            item.actionTime?.toLocaleString("en-GB") ?? ''
        ]))

        logger.just(table(rows, { 
            drawHorizontalLine: () => false, 
            drawVerticalLine: () => false 
        }));

        iterate()
    }));

export default contentLogsListCommand;
