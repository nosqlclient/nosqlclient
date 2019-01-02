import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { withNamespaces } from 'react-i18next';
import { graphql, compose } from 'react-apollo';
import { queries } from '../../modules/communicator';

class ConnectModal extends Component {
  render() {
    const { toggleConnectionModal, show, t } = this.props;

    return (
      <Modal isOpen={show} className="modal-lg">
        <ModalHeader toggle={toggleConnectionModal}>
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
          <Button color="primary" onClick={toggleConnectionModal}>{t('connectNow')}</Button>
          <Button color="secondary" onClick={toggleConnectionModal}>{t('cancel')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

ConnectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleConnectionModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default compose(
  graphql(queries.clientQueries.connectionModal.toggleConnectionModal(), { name: 'toggleConnectionModal' }),
  graphql(queries.clientQueries.connectionModal.getConnectionModal(), {
    props: ({ data: { connectionModal, loading } }) => ({
      show: connectionModal ? connectionModal.show : false,
      loading
    })
  })
)(withNamespaces()(ConnectModal));
