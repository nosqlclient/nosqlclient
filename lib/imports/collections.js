import {Mongo} from "meteor/mongo";

export const Actions = new Mongo.Collection('actions'); //actionList as string array
export const Connections = new Mongo.Collection('connections');
export const Dumps = new Mongo.Collection('dump_logs');
export const QueryHistory = new Mongo.Collection('query_histories');
export const SchemaAnalyzeResult = new Mongo.Collection('schema_analyze_result');
export const Settings = new Mongo.Collection('settings');
export const ShellCommands = new Mongo.Collection('shell_commands');

// example connections model:
/*
 {
 "connectionName": "conn_1",
 "url": "mongodb@asd",
 "servers": [
 {
 "host": "localhost",
 "port": 27017
 }
 ],
 "databaseName": "test",
 "authenticationType": "scram_sha_1",
 "scram_sha_1": {
 "username": "sercan",
 "password": "123",
 "authSource": "admin"
 },
 "mongodb_cr": {
 "username": "sercan",
 "password": "123",
 "authSource": "admin"
 },
 "mongodb_x509": {
 "username":"",
 "rootCAFile": [],
 "rootCAFileName": "name",
 "certificateFile": [],
 "certificateFileName": "name",
 "passPhrase": "123",
 "certificateKeyFile": [],
 "certificateKeyFileName": "name",
 "disableHostnameVerification": false
 },
 "gssapi": {
 "username": "sercan",
 "password": "123",
 "serviceName": "mongodb"
 },
 "plain": {
 "username": "sercan",
 "password": "123"
 },
 "ssl": {
 "enabled":false,
 "rootCAFile": [],
 "rootCAFileName": "name",
 "certificateFile": [],
 "certificateFileName": "name",
 "passPhrase": "123",
 "certificateKeyFile": [],
 "certificateKeyFileName": "name",
 "disableHostnameVerification": false
 },
 "ssh": {
 "enabled":false,
 "host": "mongoclient.com",
 "port": 12312,
 "username": "sercan",
 "certificateFile": [],
 "certificateFileName": "name",
 "passPhrase": "123",
 "password": "123"
 },
 "options": {
 "connectionTimeout": 123,
 "socketTimeout": 123,
 "readPreference": "Primary/Secondary etc..",
 "connectWithNoPrimary": false,
 "replicaSetName":"test"
 }
 }
 * */