/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import $ from 'jquery';
import { ErrorHandler, Notification } from '/client/imports/modules';
import CollectionHelper from '/client/imports/ui/collection/helper';
import { Communicator } from '/client/imports/facades';

describe('CollectionHelper', () => {
  beforeEach(() => {
    sinon.stub($.prototype, 'modal');
    sinon.stub(ErrorHandler, 'showMeteorFuncError');
    sinon.stub(Notification, 'success');
  });

  afterEach(() => {
    $.prototype.modal.restore();
    ErrorHandler.showMeteorFuncError.restore();
    Notification.success.restore();
  });

  it('executeCommand invalid param', () => {
    // prepare
    sinon.stub(Communicator, 'call');

    // execute
    CollectionHelper.executeCommand();

    // verify
    expect(Communicator.call.callCount).to.equal(0);
    expect($.prototype.modal.callCount).to.equal(0);

    // cleanup
    Communicator.call.restore();
  });

  it('executeCommand valid param & no modal & communicator yields success', () => {
    // prepare
    const command = 'testCommand';
    sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});

    // execute
    CollectionHelper.executeCommand(command);

    // verify
    expect(Communicator.call.callCount).to.equal(1);
    expect(Communicator.call.calledWithMatch({
      methodName: 'command',
      args: { command },
      callback: sinon.match.func
    })).to.equal(true);
    expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    expect(Notification.success.callCount).to.equal(1);
    expect(Notification.success.calledWithExactly('saved-successfully')).to.equal(true);
    expect($.prototype.modal.callCount).to.equal(0);

    // cleanup
    Communicator.call.restore();
  });

  it('executeCommand valid param & modal & communicator yields success', () => {
    // prepare
    const command = 'testCommand';
    const modalSelector = 'testModal';
    sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});

    // execute
    CollectionHelper.executeCommand(command, modalSelector);

    // verify
    expect(Communicator.call.callCount).to.equal(1);
    expect(Communicator.call.calledWithMatch({
      methodName: 'command',
      args: { command },
      callback: sinon.match.func
    })).to.equal(true);
    expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
    expect(Notification.success.callCount).to.equal(1);
    expect(Notification.success.calledWithExactly('saved-successfully')).to.equal(true);
    expect($.prototype.modal.callCount).to.equal(1);
    expect($.prototype.modal.calledWithExactly('hide')).to.equal(true);
    expect($.prototype.modal.getCall(0).thisValue.selector).to.equal('#testModal');

    // cleanup
    Communicator.call.restore();
  });

  it('executeCommand valid param & communicator yields error', () => {
    // prepare
    const command = 'testCommand';
    const error = { error: '1009' };
    sinon.stub(Communicator, 'call').yieldsTo('callback', error, {});

    // execute
    CollectionHelper.executeCommand(command, 'tttt');

    // verify
    expect(Communicator.call.callCount).to.equal(1);
    expect(Communicator.call.calledWithMatch({
      methodName: 'command',
      args: { command },
      callback: sinon.match.func
    })).to.equal(true);
    expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
    expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, {})).to.equal(true);
    expect(Notification.success.callCount).to.equal(0);
    expect($.prototype.modal.callCount).to.equal(0);

    // cleanup
    Communicator.call.restore();
  });

  it('executeCommand valid param & communicator yields error (1)', () => {
    // prepare
    const command = 'testCommand';
    const error = { error: '1009' };
    sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);

    // execute
    CollectionHelper.executeCommand(command, 'tttt');

    // verify
    expect(Communicator.call.callCount).to.equal(1);
    expect(Communicator.call.calledWithMatch({
      methodName: 'command',
      args: { command },
      callback: sinon.match.func
    })).to.equal(true);
    expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
    expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
    expect(Notification.success.callCount).to.equal(0);
    expect($.prototype.modal.callCount).to.equal(0);

    // cleanup
    Communicator.call.restore();
  });
});
