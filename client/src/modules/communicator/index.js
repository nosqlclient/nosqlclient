import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import defaults from './defaults';
import resolvers from './resolvers';
import { clientQueries, serverQueries, combinedQueries } from './queries';

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
        resolvers // a map of functions that read and write to the cache
      }
    });
  }
}

export default new Communicator();
export const queries = { serverQueries, clientQueries, combinedQueries };
