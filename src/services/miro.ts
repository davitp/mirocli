import { getApiUrl } from "@/core/envs";
import { AuthenticatedContext, ResolvedMiroContext } from "@/core/types";
import { MiroLowlevelApi } from "@mirohq/miro-api";
import { HttpError } from "@mirohq/miro-api/dist/api";

export function getMiroApi(context: ResolvedMiroContext, auth: AuthenticatedContext): MiroLowlevelApi {
    return new MiroLowlevelApi(auth.accessToken, getApiUrl(context.env));
}

export class MiroApiError extends Error {
    body: any;
    statusCode?: number;

    constructor(message: string, body?: any, statusCode?: number){
        super(message);
        this.body = body;
        this.statusCode = statusCode;
    }
}

export async function miroGuard<T>(fn: () => Promise<T>): Promise<T> {

    try{
       return await fn()
    }
    catch(error: any){
        if(error.body !== undefined && error.statusCode !== undefined){
            throw new MiroApiError(`The request failed with code ${error.statusCode}. Message: ${error.body?.message}`, error.body, error.statusCode);
        }

        throw error;
    }
}