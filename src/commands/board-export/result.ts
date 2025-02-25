import { createCommand } from "commander";
import { asyncHandler, getRootOptions } from "@/commands/common";
import resolveContext from "@/services/context-resolver";
import { getAuthenticatedContext } from "@/services/session-service";
import { getMiroApi } from "@/services/miro";
import { logger } from "@/services/logger";
import { oraPromise } from "ora";
import { EXPORT_SETTINGS, waitExportResult } from "@/services/board-export/wait-result";
import { printExportResultList } from "@/services/board-export/result-printer";

const boardExportResultCommand = createCommand('result')

boardExportResultCommand
    .aliases(['res', 'results'])
    .description('Wait for the job completion and get the results')
    .option('-j, --job <text>', 'The target job to wait for')
    .option('--wait', 'Should wait for the job completion before requesting the result')
    .option('--json', 'Show the result in raw json')
    .action(asyncHandler(async (options, cmd) => {

        const context = await resolveContext(getRootOptions(cmd));
        const authContext = await getAuthenticatedContext(context);
        const organizationId = context.organizationId;

        const checkEvery = EXPORT_SETTINGS.DEFAULT_CHECK_INTERVAL;
        const waitTries = options.wait ? EXPORT_SETTINGS.INFINITE_WAIT_TRIES : 0;

        const jobId = options.job as string;

        if (!jobId || jobId.length === 0) {
            throw new Error('Please provide boards to export')
        }

        const miroApi = getMiroApi(context, authContext);
        const fetcher = () => waitExportResult({ miroApi, checkEvery, waitTries, jobId, organizationId });

        const resultFetcher = options.wait ? () => oraPromise(fetcher, 
        {
            text: 'Waiting for the job results',
            successText: res => `Export completed successfully for ${res.length} boards`,
            failText: err => err.message 
        }).catch(() => process.exit(1)) : fetcher;

        const results = await resultFetcher();

        if (options.json) {
            logger.just(JSON.stringify(results, null, 4))
            return
        }

        printExportResultList(results);
    }));

export default boardExportResultCommand;
