import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

class About extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      version: '4.0.0'
    };
  }

    toggleModal = () => {
      this.setState({ show: !this.state.show });
    }

    render() {
      return (
        <Modal isOpen={this.state.show}>
          <ModalHeader toggle={this.toggleModal}>About Us</ModalHeader>
          <ModalBody>
            <img className="text-align:center" width={80} height={100} src="/assets/logo.png" alt="Logo" />
            <br />
                    Open Source Edition - Version
            <span>{this.state.version}</span>
                    Licensed with AGPLv3 © 2017
            <br />
                    Contact with
            <a href="mailto:info@mongoclient.com">info@mongoclient.com</a>
                    for Enterprise edition
          </ModalBody>
        </Modal>
      );
    }
}

export default About;
