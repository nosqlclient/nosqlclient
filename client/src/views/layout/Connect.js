import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';

class Connect extends Component {
  constructor(props) {
    super(props);

    this.state = { show: true };
  }

  toggleModal = () => {
    this.setState({ show: !this.state.show });
  }

  render() {
    return (
      <Modal isOpen={this.state.show} className="modal-lg">
        <ModalHeader toggle={this.toggleModal}>
          <i className="fa fa-laptop modal-icon" />
          <h1 className="modal-title w-100"> Connections</h1>
          <small>You can either connect an existing connection or create a new one.</small>
        </ModalHeader>
        <ModalBody>
          <Table responsive>
            <thead>
              <tr>
                <th>Connection Name</th>
                <th>Servers</th>
                <th>Properties</th>
                <th>Edit</th>
                <th>Clone</th>
                <th>Delete</th>
              </tr>
            </thead>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggleModal}>Connect Now</Button>
          {' '}
          <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default Connect;
