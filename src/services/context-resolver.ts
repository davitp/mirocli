import { ResolvedMiroContext, RootOptions } from "@/core/types";
import { loadConfig } from "./config";
import { getSecret } from "./app-secret-storage";

export default async function resolveContext(options: RootOptions): Promise<ResolvedMiroContext> {

    const { context } = options;
    const config = await loadConfig();
    
    if(!config){
        throw new Error('The Miro CLI is not configured. Init the application to start.');
    }

    const effectiveContext = context ?? config.defaultContext;
    const ctx = config.contexts.filter(item => item.name === effectiveContext)[0];

    if(!ctx){
        throw new Error(`The context '${effectiveContext}' could not be resolved. Please check the configuration.`);
    }
    
    if(!ctx.app){
        throw new Error(`The is missing in the context ${ctx.name}`);
    }

    const secret = await getSecret(ctx.name) ?? ctx.app.clientSecret;

    return {
        ...ctx,
        app: {
            ...ctx.app,
            clientSecret: secret
        }
    };
}