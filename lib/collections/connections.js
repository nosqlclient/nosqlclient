/**
 * Created by RSercan on 19.1.2016.
 */
Connections = new Mongo.Collection('connections');
Connections.attachSchema(new SimpleSchema({
    url: {
        type: "String",
        optional: true
    },
    useSsl : {
        type: "String",
        optional: true
    },
    sslCertificatePath : {
        type: "String",
        optional: true
    },
    rootCACertificatePath : {
        type: "String",
        optional: true
    },
    passphrase: {
        type: "String",
        optional: true
    },
    name: {
        type: "String"
    },
    host: {
        type: "String",
        optional: true
    },
    port: {
        type: "Number",
        optional: true
    },
    databaseName: {
        type: "String",
        optional: true
    },
    authDatabaseName: {
        type: "String",
        optional: true
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
