import { MiroLowlevelApi } from "@mirohq/miro-api"
import { miroGuard } from "../miro";
import { BoardExportTaskResult } from "@mirohq/miro-api/dist/api";

export interface WaitExportResultInput {
    miroApi: MiroLowlevelApi,
    organizationId: string,
    jobId: string,
    waitTries?: number,
    checkEvery?: number
}

export const EXPORT_SETTINGS = {
    DEFAULT_CHECK_INTERVAL: 15,
    INFINITE_WAIT_TRIES: 10000
}

export async function waitExportResult(input: WaitExportResultInput): Promise<BoardExportTaskResult[]> {

    const tries = input.waitTries ?? 0;
    const checkEvery = input.checkEvery ?? EXPORT_SETTINGS.DEFAULT_CHECK_INTERVAL;
    let finished = true;

    for(let i = 0; i < tries; ++i) {

        const { body: { jobStatus } } = await miroGuard(() => input.miroApi.enterpriseBoardExportJobStatus(
            input.organizationId,
            input.jobId
        ));

        finished = jobStatus === 'FINISHED';
        
        if(finished){
            break;
        }

        await wait(checkEvery)
    }

    if(!finished){
        throw Error('Waited for too long but did not get the result. Please try again later!')
    }

    const { body: { results } } = await miroGuard(() => input.miroApi.enterpriseBoardExportJobResults(
        input.organizationId,
        input.jobId
    ));

    return results ?? []
}

function wait(seconds: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, seconds * 1000);
    })
}