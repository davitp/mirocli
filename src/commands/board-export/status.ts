import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import {getMiroApi, miroGuard} from "@/services/miro";
import { logger } from "@/services/logger";
import chalk from "chalk";

const boardExportStatusCommand = createCommand('status')

boardExportStatusCommand
    .description('Gets the status of the job')
    .option('-j, --job <text>', 'The target job')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const jobId = options.job as string;

        if(!jobId || jobId.length === 0){
            throw new Error('Please provide boards to export')
        }

        const miroApi = getMiroApi(context, authContext);
        
        const result = await miroGuard(() => miroApi.enterpriseBoardExportJobStatus(
            context.organizationId,
            jobId
        ));

        const status = result.body.jobStatus;

        let statusWriter = chalk.bold;
        
        if(status === 'IN_PROGRESS'){
            statusWriter = chalk.blue
        }

        if(status === 'FINISHED'){
            statusWriter = chalk.green
        }

        logger.just(`The status of job '${chalk.bold(jobId)}': ${statusWriter(status)}`)
    }));

export default boardExportStatusCommand;
