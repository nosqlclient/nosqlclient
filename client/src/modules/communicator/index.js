import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import defaults from './defaults';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

/**
 * Put any graphql related operations/serverQueries into here,
 * separating modules like `gql` from the views let us change them in a further time
 * by only changing this class.
 *
 * Client state management also is being done via apollo-link-state.
 */
class Communicator {
  constructor() {
    this.client = new ApolloClient({
      link: createHttpLink({ uri: 'https://graphql-demo-v2.now.sh' }), // TODO change URL as env variable
      cache: new InMemoryCache(),
      clientState: {
        defaults, // initial state of cache
        resolvers, // a map of functions that read and write to the cache
        typeDefs // client side schema of cache
      }
    });

    this.serverQueries = {
      getBooks: fields => gql`
        {
          allBooks {
            ${fields.join(',')}
          }
        }
      `
    };

    this.clientQueries = {};

    this.combinedQueries = {};
  }
}

export default new Communicator();
