import gql from 'graphql-tag';

const resolvers = {
  Mutation: {
    toggleConnectionModal: (_, args, { cache }) => {
      const query = gql`
        connectionModal @client {
          show
        }
      `;

      const previousState = cache.readQuery({ query });
      const data = { connectionModal: { ...previousState.connectionModal, show: !previousState.show } };

      cache.writeQuery({ query, data });

      console.log(data, previousState, cache);// TODO remove

      return null;
    }
  }
};

export default resolvers;

// signature: `fieldName: (obj, args, context, info) => result;`
