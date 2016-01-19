/**
 * Created by RSercan on 19.1.2016.
 */
Connections = new Mongo.Collection('connections');
Connections.attachSchema(new SimpleSchema({
    name: {
        type: "String"
    },
    host: {
        type: "String"
    },
    port: {
        type: "Number"
    },
    databaseName: {
        type: "String"
    },
    user: {
        type: "String",
        optional: true
    },
    password: {
        type: "String",
        optional: true
    }
}));
