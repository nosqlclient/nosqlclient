import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { withClientState } from 'apollo-link-state';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
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
      link: ApolloLink.from([
        withClientState({
          cache: new InMemoryCache(),
          defaults, // initial state of cache
          resolvers // a map of functions that read and write to the cache
        }),
        new HttpLink({ uri: 'https://graphql-demo-v2.now.sh' }) // TODO change URL as env variable
      ]),
      cache: new InMemoryCache()
    });
  }
}

export default new Communicator();
export const queries = { serverQueries, clientQueries, combinedQueries };
