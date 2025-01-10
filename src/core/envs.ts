import { settings } from "@/services/settings";
import { MiroEnv } from "./types";

const DEFAULT_API_URL = 'https://api.miro.com'
const envMap: Record<string, MiroEnv> = Object.fromEntries(settings.envs .map(item => [item.name, item]))

export function getAllEnvNames(){
    return Object.keys(envMap);
}

export function getApiUrl(env: string): string {

    const apiUrl = envMap[env]?.apiUrl ?? DEFAULT_API_URL

    if(!apiUrl){
        throw Error(`The environment ${env} is not supported`)
    }

    return apiUrl;
}

export function getTokenUrl(env: string): string {
    return `${getApiUrl(env)}/v1/oauth/token`
}

export function getBaseUrl(env: string): string {
    return getApiUrl(env).replace('api.', '');
}

export function getAuthorizeUrl(env: string): string {
    return `${getBaseUrl(env)}/oauth/authorize`
}