import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import { parseDateTime } from "@/services/date-time-parser";
import { subDays } from "date-fns";
import { table } from "table";
import { ellipsis } from "@/services/text-utils";

const auditLogsListCommand = createCommand('list')

auditLogsListCommand
    .description('List audit logs in the organization according to the filter')
    .option('-f, --from <date>', 'The start time of the logs')
    .option('-t, --to <date>', 'The end time of the logs')
    .option('--emails <text...>', 'Email addresses to filter')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const now = new Date();

        const from = options.from ? parseDateTime(options.from) : subDays(now, 1);
        const to = options.to ? parseDateTime(options.to, now) : now;

        const miroApi = getMiroApi(context, authContext);
        
        const result = await miroGuard(() => miroApi.enterpriseGetAuditLogs(
            from.toISOString(),
            to.toISOString(),
            {
                limit: 10
            }
        ))
    
        if(options.json){
            logger.just(JSON.stringify(result.body.data, null, 4))
            return
        }

        const header = ['Event', 'Category', 'Object', 'Actor', 'IP', 'Details'];
        const rows = [header];

        result.body.data?.forEach(item => rows.push([
            item.event ?? '',
            item.category ?? '',
            `${item.object?.name}`,
            `${item.createdBy?.email}`,
            item.context?.ip ?? '',
            ellipsis(`${JSON.stringify(item.details ?? {})}`, 15)
        ]))

        logger.just(table(rows, { 
            drawHorizontalLine: () => false, 
            drawVerticalLine: () => false 
        }));
    }));

export default auditLogsListCommand;
