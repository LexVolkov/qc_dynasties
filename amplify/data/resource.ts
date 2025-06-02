import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Square: a
    .model({
      map: a.json().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Dynasty: a
    .model({
      color: a.string().required(),
      name: a.string().required(),
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