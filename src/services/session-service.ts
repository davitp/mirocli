import { AuthenticatedContext, ResolvedMiroContext, SessionState, StoredSession } from '@/core/types';
import { refresh, TokenResult } from './authorize';
import { getSession as storageGetSession, deleteSession as storageDeleteSession, setSession as storageSetSession } from './session-storage';

export function storeSession(context: string, session: StoredSession): Promise<void> {
    return storageSetSession(context, session);
}

export function deleteSession(context: string): Promise<void> {
    return storageDeleteSession(context)
}

export async function getSessionState(context: string): Promise<SessionState | null>{

    const stored = await storageGetSession(context);

    if(!stored){
        return null;
    }

    return {
        userId: stored.userId,
        expiresAt: stored.expiresAt,
        expired: stored.expiresAt.getTime() < new Date().getTime()
    }
}

export async function getAuthenticatedContext(context: ResolvedMiroContext): Promise<AuthenticatedContext> {

    const storedSession = await storageGetSession(context.name);

    if (!storedSession || !storedSession.accessToken) {
        throw Error('You need to authenticate to continue.')
    }

    if (storedSession.expiresAt.getTime() > new Date().getTime()) {
        return {
            userId: storedSession.userId,
            accessToken: storedSession.accessToken,
            refreshToken: storedSession.refreshToken,
            expiresAt: storedSession.expiresAt
        }
    }

    if (!storedSession.refreshToken) {
        throw Error('Your session has expired. Please login again.')
    }

    let refreshed: TokenResult | null = null;

    try {
        refreshed = await refresh({ context, accessToken: storedSession.accessToken, refreshToken: storedSession.refreshToken })
        await storeSession(context.name, { 
            userId: storedSession.userId,
            accessToken: refreshed.accessToken, 
            refreshToken: refreshed.accessToken, 
            expiresAt: refreshed.expiresAt
        })
    }
    catch(error: any){
        await deleteSession(context.name)
        console.log(error)
        throw Error(`Error while refreshing the access token: ${error.message ?? 'Unknown Error'}`)
    }
    
    const newSession = await storageGetSession(context.name);

    if(!newSession || !refreshed){
        await deleteSession(context.name)
        throw Error('Could not extend your session, please login again.')
    }

    return {
        userId: newSession.userId,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt
    }
}
