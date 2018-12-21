import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Query } from 'react-apollo';
import Communicator, { createQuery } from '../../modules/communicator';

class Dashboard extends Component {
  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12" lg="12">
            <Query query={createQuery(Communicator.queries.getBooks(['author', 'title', 'id']))}>
              {({ loading, error, data }) => {
                if (loading) return <p>Loading...</p>;
                if (error) {
                  return (
                    <p>
                      Error:
                      {JSON.stringify(error)}
                    </p>
                  );
                }

                return data.allBooks.map(({id, author, title }) => (
                  <div key={id}>
                    <p>{`${id}: ${author}: ${title}`}</p>
                  </div>
                ));
              }}
            </Query>
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
