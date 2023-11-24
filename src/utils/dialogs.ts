import inquirer from 'inquirer';
import inquirerSearchList from 'inquirer-search-list';
import { removeUnderscoresAndCapitalize } from './strings';
import { getDeviceCredentials } from './deviceCredentials';
import {
    PrintableVaultCredential,
    PrintableVaultNote,
    PrintableVaultSecret,
    VaultCredential,
    VaultNote,
    VaultSecret,
} from '../types';
import { GetAuthenticationMethodsForDeviceResult } from '../endpoints/getAuthenticationMethodsForDevice';
import PromptConstructor = inquirer.prompts.PromptConstructor;

export const prompt = inquirer.createPromptModule({ output: process.stderr });
prompt.registerPrompt('search-list', inquirerSearchList as PromptConstructor);

export const askMasterPassword = async (): Promise<string> => {
    const deviceCredentials = getDeviceCredentials();
    if (deviceCredentials !== null) {
        return deviceCredentials.masterPassword;
    }

    const response = await prompt<{ masterPassword: string }>([
        {
            type: 'password',
            name: 'masterPassword',
            message: 'Please enter your master password:',
            validate(input: string) {
                return input.length ? true : 'Master password cannot be empty';
            },
        },
    ]);
    return response.masterPassword;
};

export const askReplaceIncorrectMasterPassword = async () => {
    const response = await prompt<{ replaceMasterPassword: string }>([
        {
            type: 'list',
            name: 'replaceMasterPassword',
            message: 'The master password you provided is incorrect, would you like to retry?',
            choices: ['Yes', 'No'],
        },
    ]);
    return response.replaceMasterPassword === 'Yes';
};

export const askIgnoreBreakingChanges = async () => {
    const response = await prompt<{ ignoreBreakingChanges: string }>([
        {
            type: 'list',
            name: 'ignoreBreakingChanges',
            message:
                'Your local storage has been generated by a different version of the CLI and surely cannot be read. Would you like to:',
            choices: ['Reset your local storage', 'Ignore the warning'],
        },
    ]);
    return response.ignoreBreakingChanges === 'Ignore the warning';
};

export const askEmailAddress = async (): Promise<string> => {
    const deviceCredentials = getDeviceCredentials();
    if (deviceCredentials !== null) {
        return deviceCredentials.login;
    }

    const response = await prompt<{ login: string }>([
        {
            type: 'input',
            name: 'login',
            message: 'Please enter your email address:',
            validate(input: string) {
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                    input
                )
                    ? true
                    : 'Not a valid email address';
            },
        },
    ]);
    return response.login;
};

export const askConfirmReset = async () => {
    const response = await inquirer.prompt<{ confirmReset: string }>([
        {
            type: 'list',
            name: 'confirmReset',
            message: 'Do you really want to logout and delete all local data from this app?',
            choices: ['Yes', 'No'],
        },
    ]);
    return response.confirmReset === 'Yes';
};

export const askCredentialChoice = async (params: { matchedCredentials: VaultCredential[]; hasFilters: boolean }) => {
    const message = params.hasFilters
        ? 'There are multiple results for your query, pick one:'
        : 'What password would you like to get?';

    const response = await prompt<{ printableCredential: PrintableVaultCredential }>([
        {
            type: 'search-list',
            name: 'printableCredential',
            message,
            choices: params.matchedCredentials.map((item) => {
                const printableItem = new PrintableVaultCredential(item);
                return { name: printableItem.toString(), value: printableItem };
            }),
        },
    ]);

    return response.printableCredential.vaultCredential;
};

export const askSecureNoteChoice = async (params: { matchedNotes: VaultNote[]; hasFilters: boolean }) => {
    const message = params.hasFilters
        ? 'There are multiple results for your query, pick one:'
        : 'What note would you like to get?';

    const response = await prompt<{ printableNote: PrintableVaultNote }>([
        {
            type: 'search-list',
            name: 'printableNote',
            message,
            choices: params.matchedNotes.map((item) => {
                const printableItem = new PrintableVaultNote(item);
                return { name: printableItem.toString(), value: printableItem };
            }),
        },
    ]);

    return response.printableNote.vaultNote;
};

export const askSecretChoice = async (params: { matchedSecrets: VaultSecret[]; hasFilters: boolean }) => {
    const message = params.hasFilters
        ? 'There are multiple results for your query, pick one:'
        : 'What secret would you like to get?';

    const response = await prompt<{ printableSecret: PrintableVaultSecret }>([
        {
            type: 'search-list',
            name: 'printableSecret',
            message,
            choices: params.matchedSecrets.map((item) => {
                const printableItem = new PrintableVaultSecret(item);
                return { name: printableItem.toString(), value: printableItem };
            }),
        },
    ]);

    return response.printableSecret.vaultSecret;
};

export const askOtp = async () => {
    const response = await prompt<{ otp: string }>([
        {
            type: 'input',
            name: 'otp',
            message: 'Please enter your OTP code:',
            validate(input: string) {
                return /^(\d{4,16})$/.test(input) ? true : 'Not a valid OTP';
            },
        },
    ]);
    return response.otp;
};

export const askToken = async () => {
    const response = await prompt<{ token: string }>([
        {
            type: 'input',
            name: 'token',
            message: 'Please enter the code you received by email:',
            validate(input: string) {
                return /^(\d{6})$/.test(input) ? true : 'Not a valid email token';
            },
        },
    ]);
    return response.token;
};

export const askVerificationMethod = async (
    verificationMethods: GetAuthenticationMethodsForDeviceResult['verifications']
) => {
    const response = await inquirer.prompt<{
        verificationMethod: GetAuthenticationMethodsForDeviceResult['verifications'][0];
    }>([
        {
            type: 'list',
            name: 'verificationMethod',
            message: 'What second factor method would you like to use?',
            choices: verificationMethods.map((method) => {
                return { name: removeUnderscoresAndCapitalize(method.type), value: method };
            }),
        },
    ]);
    return response.verificationMethod;
};
