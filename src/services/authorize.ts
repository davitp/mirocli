import open from 'open';
import http from 'http';
import crypto from 'crypto';
import { logger } from '@/services/logger';
import axios from 'axios';
import { ResolvedMiroContext } from '@/core/types';
import { getAuthorizeUrl, getTokenUrl } from '@/core/envs';
import { settings } from './settings';

const AUTH_TIMEOUT_SECONDS = 5 * 60;

export interface TokenResult{
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    expiresAt: Date,
    scope: string,
}

export interface MiroTokenResult extends TokenResult {
    userId: string,
    teamId: string | null,
}

type CodeResponse = {
    state: string | null,
    code: string | null
}

export async function refresh({ context, accessToken, refreshToken }: { context: ResolvedMiroContext, accessToken: string, refreshToken: string }): Promise<TokenResult> {

    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: context.app.clientId,
        client_secret: context.app.clientSecret ?? '',
        refresh_token: refreshToken,
        access_token: accessToken,
    });

    const response = await axios.post(getTokenUrl(context.env), body);

    const result = response.data;

    return {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
        expiresAt: new Date(new Date().getTime() + result.expires_in * 1000),
        scope: result.scope
    }   
}

export function getCallbackUrl(){
    return `http://localhost:${settings.cliPort}/auth/callback`
}

export async function authorize(context: ResolvedMiroContext): Promise<MiroTokenResult> {

    const state = crypto.randomBytes(16).toString('hex');

    const redirectUri = getCallbackUrl();

    const authUrl = `${getAuthorizeUrl(context.env)}?${new URLSearchParams({
        response_type: 'code',
        client_id: context.app.clientId,
        redirect_uri: redirectUri,
        state: state
    }).toString()}`;

    logger.info(`To complete authentication please login in the browser...`)

    await open(authUrl).catch(() => {
        logger.info(`If login page was not opened automatically, please use the following link to login: ${authUrl}`)
    });

    const code = await waitForCode({ port: settings.cliPort });

    if (code.state !== state) {
        throw Error('Authentication failed due to state mismatch');
    }

    if (!code.code) {
        throw Error('Authentication failed due to missing authorization code')
    }

    try {
        return await exchangeCode({
            context,
            tokenUrl: getTokenUrl(context.env),
            code: code.code,
            redirectUri: redirectUri
        })
    }
    catch(error: any){
        console.log("Could not exchange code for token", error)
        throw error;
    }
    
}

async function waitForCode({ port }: { port: any }): Promise<CodeResponse> {

    const server = http.createServer();
    server.listen(port, () => {
        logger.info(`Waiting for the user to complete authentication in the browser...`);
    });

    const controller = new AbortController();

    try {
        return await Promise.race([
            codePromise(server),
            timeoutPromise(AUTH_TIMEOUT_SECONDS, controller)
        ]);
    }
    finally {
        controller.abort();
        server.close();
    }
}

function codePromise(server: http.Server): Promise<CodeResponse> {
    return new Promise((resolve) => {
        server.on('request', (req, res) => {
            const query = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
            const code = query.get('code');
            const state = query.get('state');

            if (!code) {
                res.writeHead(404);
                res.end('Not found')
                return;
            }


            resolve({ code, state })

            res.writeHead(200);
            res.end('Authentication is in progress. You can close the browser.')
        });
    })
}

function timeoutPromise(seconds: number, controller: AbortController): Promise<CodeResponse> {
    return new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Authentication was not completed within ${seconds / 60} minutes.`));
            controller.abort();
        }, seconds * 1000);

        controller.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
        });
    });
}

async function exchangeCode({ context, tokenUrl, code, redirectUri }: { context: ResolvedMiroContext, tokenUrl: string, code: string, redirectUri: string }): Promise<MiroTokenResult> {

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: context.app.clientId,
        client_secret: context.app.clientSecret ?? ''
    });

    const response = await axios.post(tokenUrl.toString(), body);

    const result = response.data;

    return {
        userId: result.user_id,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        scope: result.scope,
        expiresIn: result.expires_in,
        expiresAt: new Date(new Date().getTime() + result.expires_in * 1000),
        teamId: result.team_id
    }
}