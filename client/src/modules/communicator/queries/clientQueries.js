import gql from 'graphql-tag';

const clientQueries = {
  connectionModal: {
    toggleConnectionModal: () => gql`
      mutation {
        toggleConnectionModal @client {
          show
        }
      }
    `,
    getConnectionModal: () => gql`
      query {
        connectionModal @client {
          show
        }
      }
    `
  }
};

export default clientQueries;
