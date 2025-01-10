import { createCommand } from "commander";
import { asyncHandler } from "@/commands/common";
import { loadConfig, saveConfig } from "@/services/config";
import { logger } from "@/services/logger";
import prompts, { PromptObject } from "prompts";
import { setSecret } from "@/services/app-secret-storage";
import { getAllEnvNames } from "@/core/envs";

const contextAddCommand = createCommand('add')

contextAddCommand
    .description('Add new context to the configuration')
    .action(asyncHandler(async (_, cmd) => {

        const existing = (await loadConfig()) ?? {
            contexts: [],
            defaultContext: ''
        };

        const envs = getAllEnvNames();

        const questions: PromptObject[] | any[]  = [
            {
                type: 'text',
                name: 'name',
                message: 'How do you want to call the new context?',
                initial: 'default',
                validate: value => existing.contexts.some(ctx => ctx.name === value) ? `The context with name ${value} already exists` : true
            },
            envs.length > 1 ? {
                type: 'text',
                name: 'env',
                initial: '',
                choices: [envs.map(item => ({ title: item, value: item })), { title: '', value: '' }],
                message: 'Which environment you refer to?',
                validate: value => !value || envs.includes(value) ? true : `The environment ${value} is not supported`
            } : null,
            {
                type: 'text',
                name: 'organizationId',
                message: 'Which organization you want to use?',
                validate: value => value?.length > 0 ? true : `The organization id cannot be empty`
            },
            {
                type: 'text',
                name: 'clientId',
                message: 'What is your apps client id?',
                validate: value => value?.length > 0 ? true : `The client id cannot be empty`
            },
            {
                type: 'text',
                name: 'clientSecret',
                message: 'What is your apps client secret?',
                validate: value => value?.length > 0 ? true : `The client secret cannot be empty`
            },
        ]

        const values = await prompts(questions.filter(item => item));

        if(!values.clientSecret){
            throw new Error('Please enter all the required values!')
        }

        existing.contexts.push({
            name: values.name,
            env: values.env,
            organizationId: values.organizationId,
            app: {
                clientId: values.clientId
            }
        })

        if(existing.contexts.length === 1 || !existing.defaultContext){
            existing.defaultContext = existing.contexts[0]?.name ?? ''
        }

        await setSecret(values.name, values.clientSecret);
        await saveConfig(existing);

        logger.info(`New context ${values.name} is created referring to app ${values.clientId}`);
    }));

export default contextAddCommand;
