import React, { Component } from 'react';

class Dashboard extends Component {
  render() {
    return (
      <div className='row'>
        <div className='col-lg-6 col-lg-offset-3'>
          <div className='text-center m-t-lg'>
            <div className='panel panel-primary'>
              <div className='panel-heading'>Testing</div>
              <div className='panel-body'>
                <p>Donation</p>
                <p>
                  <b>BTC: </b>
                  <i>34RHhcvbS5kYFEgRXQURnpcGkn3LvMQB4k </i>
                  <br />
                  <br />
                  <b>ETH / ERC-20: </b>
                  <i>0xA5B7922F058b4675DcE7ACfDC6d43E9b8eC68De6</i>
                  <br />
                  <br />
                  <b>NEO: </b>
                  <i>AQvAHSXchhdLJP6BJdc1LRzhrPsaMhPzr6</i>
                  <br />
                  <br />
                  <b>Paypal: </b>
                  <a href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y5VD95E96NU6S'>Donate</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
