import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Square: a
    .model({
      coords: a.integer(),

      dynastyId: a.string(),
      dynasty: a.belongsTo('Dynasty', 'dynastyId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Dynasty: a
    .model({
      color: a.string(),
      name: a.string(),

      squares: a.hasMany('Square', 'dynastyId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

})

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});