import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import { getMiroApi, miroGuard } from "@/services/miro";
import { logger } from "@/services/logger";
import chalk from "chalk";
import { oraPromise } from "ora";
import { EXPORT_SETTINGS, waitExportResult } from "@/services/board-export/wait-result";
import { printExportResultList } from "@/services/board-export/result-printer";

const ALLOWED_FORMATS = ['SVG', 'PDF', 'HTML'];

const boardExportSubmitCommand = createCommand('submit')

boardExportSubmitCommand
    .description('Submits boards for to initiate the export')
    .option('-b, --boards <text...>', 'The boards to export')
    .option('--format <string>', 'The format of boards to export', 'SVG')
    .option('--wait', 'Should wait for the job completion before requesting the result')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);

        const boardIds = Array.from(new Set<string>(options.boards ?? []));

        if (boardIds.length === 0) {
            throw new Error('Please provide boards to export')
        }

        const organizationId = context.organizationId;
        const requestId = crypto.randomUUID();
        const boardFormat = options.format;

        if (!ALLOWED_FORMATS.includes(boardFormat)) {
            throw new Error(`The '${boardFormat}' is not a valid export format`)
        }

        const miroApi = getMiroApi(context, authContext);

        const submitter = miroGuard(() => miroApi.enterpriseCreateBoardExport(
            organizationId,
            requestId,
            { boardFormat, boardIds }
        ));

        const { body: { jobId } } = await oraPromise(submitter, {
            text: `Submitting ${boardIds.length} boards to export in ${boardFormat} format`,
            successText: res => `Successfully created the job ${chalk.bold(res.body.jobId)} 🚀`,
            failText: err => err.message
        }).catch(() => process.exit(1));


        if(!options.wait){
            logger.just(`\nMore actions:`)
            logger.just(` - Check status of the job: ${chalk.bold(`mirocli be status -j ${jobId}`)}`)
            logger.just(` - Get result of the job: ${chalk.bold(`mirocli be result -j ${jobId} --wait`)}`)
            return;
        }

        const checkEvery = EXPORT_SETTINGS.DEFAULT_CHECK_INTERVAL;
        const waitTries = EXPORT_SETTINGS.INFINITE_WAIT_TRIES;

        const results = await oraPromise(waitExportResult({ miroApi, checkEvery, waitTries, jobId, organizationId }) , 
        {
            text: 'Waiting for the job results',
            successText: res => `Export completed successfully for ${res.length} boards`,
            failText: err => err.message 
        }).catch(() => process.exit(1));
        
        printExportResultList(results)
    }));

export default boardExportSubmitCommand;
