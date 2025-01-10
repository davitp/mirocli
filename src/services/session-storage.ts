import keytar from 'keytar';
import { StoredSession } from '@/core/types';

const SERVICE = 'sessions.mirocli.local';

export async function getSession(context: string): Promise<StoredSession | null> {
    const result = await keytar.getPassword(SERVICE, context);

    if(!result){
        return null;
    }

    const parsed = JSON.parse(result);

    return {
        userId: parsed.userId,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresAt: new Date(parsed.expiresAt)
    }
}

export function setSession(context: string, value: StoredSession): Promise<void>{
    return keytar.setPassword(SERVICE, context, JSON.stringify(value))
}

export async function deleteSession(context: string): Promise<void>{
    await keytar.deletePassword(SERVICE, context)
}

export async function clearSessions(): Promise<void> {
    const items = await keytar.findCredentials(SERVICE)
    
    for(const item of items){
        await keytar.deletePassword(SERVICE, item.account)
    }
}