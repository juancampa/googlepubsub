import { client } from './client.js';
import { randomBytes } from 'crypto';
const { root } = program.refs; 

// TODO: this should be passed down to the module just like process
const program = global.program;

export function init() {
}

export function update() {
}

export async function endpoint({ name, req }) {
  switch (name) {
    case 'webhooks': {
      let { subscription, message } = req.body;
      subscription = subscription.replace(/^.*\//, '');
      const topicName = getTopicName(subscription);
      console.log('SUB-TOP', subscription, topicName);
      const eventArgs = {
        id: message.id,
        data: message.data,
        publishTime: message.publishTime,
      };
      await root.topic({ name: topicName }).messageReceived.dispatch(eventArgs);
      break;
    }
    default:
      console.log('Unknown endpoint', name);
      throw new Error('Unknown endpoint');
  }
}

export let Root = {
  async topic({ args }) {
    const [topic, response] = await client.topic(args.name).get();
    return topic;
  },

  async createTopic({ self, args }) {
    const [topic, response] = await client.topic(args.name).create();
  }
}

export let Topic = {
  // Creates a topic subscription in Google Pub/Sub
  async createSubscription({ self, args }) {
    const { name: topic } = self.match(root.topic());
    const { name, pushEndpoint } = args;
    const [subscription, response] = await client.subscribe(topic, name, { pushEndpoint });
  },

  messageReceived: {
    async subscribe({ self, args }) {
      const { name: topic } = self.match(root.topic());
      if (!topic || typeof topic !== 'string') {
        // TODO: optional in schema?
        throw new Error('Topic must be specified');
      }
      const name = getSubscriptionName(topic);
      const options = { pushEndpoint: program.endpoints.webhooks.url };
      const [subscription, response] = await client.subscribe(topic, name, options);
    },

    async unsubscribe({ self, args }) {
      const { name: topic } = self.match(root.topic());
      const name = getSubscriptionName(topic);
      const [response] = await client.topic(topic).subscription(name).delete();
    }
  }
}

function getTopicName(topicName) {
  return topicName.replace('membrane-driver-', '');
}

function getSubscriptionName(topicName) {
  return 'membrane-driver-' + topicName;
}
