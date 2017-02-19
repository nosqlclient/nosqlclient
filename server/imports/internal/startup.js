/**
 * Created by RSercan on 17.1.2016.
 */
import {Meteor} from "meteor/meteor";
import {Settings} from "/lib/imports/collections/settings";
import {Connections} from "/lib/imports/collections/connections";
import ShellCommands from "/lib/imports/collections/shell";
import SchemaAnalyzeResult from "/lib/imports/collections/schema_analyze_result";
import {HttpBasicAuth} from "meteor/jabbslad:basic-auth";
import {parseUrl} from "./internal_methods";

/**
 * Migrates 1.x version connections to 2.x
 */
const migrateConnectionsIfExist = function () {
    let settings = Settings.findOne();
    if (settings.isMigrationDone) {
        return;
    }

    let connectionsAfterMigration = [];

    for (let oldConnection of Connections.find().fetch()) {
        let connection = {options: {}};
        if (oldConnection.url) {
            connection = parseUrl({url: oldConnection.url});
            connection.url = oldConnection.url;
        }

        connection._id = oldConnection._id;
        connection.connectionName = oldConnection.name;

        migrateSSHPart(oldConnection, connection);
        if (oldConnection.host && oldConnection.port) {
            connection.servers = [{
                host: oldConnection.host,
                port: oldConnection.port
            }];
        }
        if (oldConnection.readFromSecondary) connection.options.readPreference = "secondary";
        else connection.options.readPreference = "primary";

        if (oldConnection.databaseName) connection.databaseName = oldConnection.databaseName;

        if (oldConnection.user && oldConnection.password) {
            connection.scram_sha_1 = {
                username: oldConnection.user,
                password: oldConnection.password
            };
            if (oldConnection.authDatabaseName) connection.scram_sha_1.authSource = oldConnection.authDatabaseName;
            connection.authenticationType = "scram_sha_1";
        }

        if (oldConnection.useSsl || oldConnection.sslCertificatePath) connection.ssl = {enabled: true};

        if (oldConnection.x509Username) {
            connection.authenticationType = "mongodb_x509";
            connection.mongodb_x509 = {username: oldConnection.x509Username};
            delete connection.ssl;
        }

        if (oldConnection.sslCertificatePath) {
            let objToChange = oldConnection.x509Username ? connection.mongodb_x509 : connection.ssl;
            objToChange.certificateFile = oldConnection.sslCertificate;
            objToChange.certificateFileName = oldConnection.sslCertificatePath;
            objToChange.passPhrase = oldConnection.passPhrase;
            if (oldConnection.rootCACertificatePath) {
                objToChange.rootCAFile = oldConnection.rootCACertificate;
                objToChange.rootCAFileName = oldConnection.rootCACertificatePath;
            }
            if (oldConnection.certificateKeyPath) {
                objToChange.certificateKeyFile = oldConnection.certificateKey;
                objToChange.certificateKeyFileName = oldConnection.certificateKeyPath;
            }
        }

        connectionsAfterMigration.push(connection);
    }


    Connections.remove({});
    for (let conn of connectionsAfterMigration) Connections.insert(conn);

    /* Settings.update({}, {
     $set: {
     isMigrationDone: true,
     }
     });
     */
};

const migrateSSHPart = function (oldConnection, connection) {
    if (oldConnection.sshAddress) {
        connection.ssh = {
            enabled: true,
            host: oldConnection.sshAddress,
            port: oldConnection.sshPort,
            username: oldConnection.sshUser,
        };

        if (oldConnection.sshPassword) connection.ssh.password = oldConnection.sshPassword;
        else {
            connection.ssh.certificateFile = oldConnection.sshCertificate;
            connection.ssh.certificateFileName = oldConnection.sshCertificatePath;
            connection.ssh.passPhrase = oldConnection.sshPassPhrase;
        }
    }
};

Meteor.startup(function () {
    let home = process.env.HOME || process.env.USERPROFILE;
    home = home.replace(/\\/g, "/");
    if (!Settings.findOne()) {
        Settings.insert({
            scale: "MegaBytes",
            defaultResultView: "Jsoneditor",
            maxAllowedFetchSize: 3,
            autoCompleteFields: false,
            socketTimeoutInSeconds: 5,
            connectionTimeoutInSeconds: 3,
            dbStatsScheduler: 3000,
            showDBStats: true,
            showLiveChat: false,
            dumpPath: home + "/myDumps/"
        });
    }

    if (process.env.MONGOCLIENT_AUTH == 'true') {
        let basicAuth = new HttpBasicAuth(function (username, password) {
            return (process.env.MONGOCLIENT_USERNAME == username && process.env.MONGOCLIENT_PASSWORD == password);
        });
        basicAuth.protect();
    }

    ShellCommands.remove({});
    SchemaAnalyzeResult.remove({});
    migrateConnectionsIfExist();
});