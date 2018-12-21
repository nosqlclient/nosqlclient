import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';

/**
 * Put any graphql related operations/queries into here,
 * separating modules like `gql` from the views let us change them in a further time
 * by only changing this class.
 */
class Communicator {
  constructor() {
    this.client = new ApolloClient({
      link: createHttpLink({ uri: 'https://graphql-demo-v2.now.sh' }),
      cache: new InMemoryCache()
    });

    this.queries = {
      getBooks: fields => `
        {
          allBooks {
            ${fields.join(',')}
          }
        }
      `
    };
  }
}

export function createQuery(query) {
  console.log(query); // TODO remove
  return gql`${query}`; // tagged template literal gql.
}

export default new Communicator();
