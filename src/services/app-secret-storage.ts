import keytar from 'keytar';

const SERVICE = 'appsecrets.mirocli.local';

export function getSecret(context: string): Promise<string | null> {
    return keytar.getPassword(SERVICE, context);
}

export function setSecret(context: string, value: string): Promise<void>{
    return keytar.setPassword(SERVICE, context, value)
}
export async function deleteSecret(context: string,): Promise<void>{
    await keytar.deletePassword(SERVICE, context)
}

export async function clearSecrets(): Promise<void> {
    const items = await keytar.findCredentials(SERVICE)
    
    for(const item of items){
        await keytar.deletePassword(SERVICE, item.account)
    }
}