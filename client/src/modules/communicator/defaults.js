const defaults = {
  isConnected: false, // current connection state nosqlclient @client
  sessionId: '', // unique session id that comes from backend @server
  connectionModal: {
    show: false, // @client
    connections: [], // connections which will be listed on datatable @server
    __typename: 'ConnectionModal'
  },
  aboutModal: {
    show: false, // @client
    version: '4.0.0', // TODO
    __typename: 'AboutModal'
  }
};

export default defaults;
