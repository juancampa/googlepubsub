import * as pubsub from '@google-cloud/pubsub';

const env = process.env;

const config = {
  projectId: env.projectId,
  credentials: {
    client_email: env.clientEmail,
    private_key: env.privateKey,
  }
};

export let client = pubsub(config);

