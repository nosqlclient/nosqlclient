import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';

class Communicator {
  constructor() {
    this.client = new ApolloClient({
      link: createHttpLink({ uri: 'https://w5xlvm3vzz.lp.gql.zone/graphql' }),
      cache: new InMemoryCache()
    });
  }
}


export default new Communicator();
