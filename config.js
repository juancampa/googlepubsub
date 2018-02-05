const { environment, schema, endpoints } = program;

environment
  .add('projectId', 'The Project ID')
  .add('clientEmail', 'The email address as provided by Google Cloud Console')
  .add('privateKey', 'The private key')

endpoints
  .https('webhooks', 'Push notifications')

schema.type('Root')
  .computed('subscription', 'Subscription')
    .param('name', 'String')
  .computed('topic', 'Topic')
    .param('name', 'String')
  .action('createTopic')
    .param('name', 'String')

schema.type('Subscription')
  .field('name', 'String')
  .field('topic', 'String')
  // .field('pushConfig', 'PushConfig')
  .field('ackDeadlineSeconds', 'Float')

schema.type('Topic')
  .field('name', 'String', 'Name of the topic')
  .action('createSubscription')
    .param('name', 'String')
    .param('pushEndpoint', 'String')
  .event('messageReceived')
    .param('id', 'String')
    .param('data', 'String')
    .param('publishTime', 'String')   // TODO: use a standardized Date type
    // .param('attributes', 'MessageAttributes')

