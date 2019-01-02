import gql from 'graphql-tag';

const serverQueries = {
  getBooks: fields => gql`
        {
          allBooks {
            ${fields.join(',')}
          }
        }
      `
};

export default serverQueries;
