import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { withNamespaces } from 'react-i18next';

class ConnectModal extends Component {
  constructor(props) {
    super(props);

    this.state = { show: true };
  }

  toggleModal = () => {
    this.setState({ show: !this.state.show });
  }

  render() {
    const { t } = this.props;

    return (
      <Modal isOpen={this.state.show} className="modal-lg">
        <ModalHeader toggle={this.toggleModal}>
          <i className="fa fa-laptop modal-icon" />
          {t('Connections')}
          <br />
        </ModalHeader>
        <ModalBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{t('Connection Name')}</th>
                <th>{t('Servers')}</th>
                <th>{t('Properties')}</th>
                <th>{t('Edit')}</th>
                <th>{t('Clone')}</th>
                <th>{t('Delete')}</th>
              </tr>
            </thead>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggleModal}>{t('connectNow')}</Button>
          <Button color="secondary" onClick={this.toggleModal}>{t('cancel')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default withNamespaces()(ConnectModal);
