import React, { Component } from 'react';
import { Col, Row, Card, CardBody, CardHeader, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { withNamespaces } from 'react-i18next';

class Settings extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12" md="12">
            <Card>
              <CardHeader>
                {t('Application Settings')}
              </CardHeader>
              <CardBody>
                <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">{t('Max allowed fetch size for FIND query')}</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <InputGroup>
                        <Input type="text" value="0" />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>MB</InputGroupText>
                        </InputGroupAddon>
                        {/* <FormText color="muted">{t('helper')}</FormText> */}
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">{t('Socket timeout')}</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <InputGroup>
                        <Input type="text" value="0" />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>{t('Seconds')}</InputGroupText>
                        </InputGroupAddon>
                        {/* <FormText color="muted">{t('helper')}</FormText> */}
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">{t('Connection timeout')}</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <InputGroup>
                        <Input type="text" value="0" />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>{t('Connection timeout')}</InputGroupText>
                        </InputGroupAddon>
                        {/* <FormText color="muted">{t('helper')}</FormText> */}
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">{t('Database statistics scheduler')}</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <InputGroup>
                        <Input type="text" value="0" />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>{t('Milliseconds')}</InputGroupText>
                        </InputGroupAddon>
                        {/* <FormText color="muted">{t('helper')}</FormText> */}
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="select">{t('Size information in')}</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="select" id="select">
                        <option value="MB">MegaBytes</option>
                        <option value="KB">KiloBytes</option>
                        <option value="B">Bytes</option>
                      </Input>
                    </Col>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withNamespaces()(Settings);
