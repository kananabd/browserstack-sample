import * as dotenv from 'dotenv'

let envLoaded = false; // To prevent duplicate loading

export const getEnv = () => {
    if (envLoaded) {
        return;
    }

    // Set a default environment if ENV is not explicitly passed
    const env = process.env.ENV || 'dev.hfwebauto';

    dotenv.config({
        override: false,
        path: `env/.env.${env}`,
    });

    console.log(`Loaded environment file: env/.env.${env}`);
    envLoaded = true;
};