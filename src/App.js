import React from 'react';
import { Progress, Icon, InputNumber, Button, Tooltip, message } from 'antd';
import http from './utils';
import 'antd/dist/antd.css';
import './App.scss';

class App extends React.Component {

  state = {
    amount: 10,
    loading: false,
    total: 0,
    count: 0,
  }

  componentDidMount() {
    this.handleFetchDonations();
  }

  onChange = (value) => {
    this.setState({
      amount: value,
    })
  }

  validate = () => {
    const donationLeft = 1000 - this.state.total;
    if (isNaN(this.state.amount)) {
      message.error('Amount must be in number!');
      return false;
    }
    if (!this.state.amount) {
      message.error('Amount cannot be zero!');
      return false;
    }
    if (this.state.amount > donationLeft) {
      message.info(`You cannot donate more than $${donationLeft}`);
      return false;
    }
  }

  handleDonate = () => {
    const payload = {
      amount: this.state.amount,
      time: new Date().toLocaleString(),
    };

    if (this.validate()) {
      return;
    }

    this.setState({ loading: true }, () => {
      return http.post('/update', payload)
      .then((resp) => {
        message.info('Your donation has been received successfully!');
        this.setState({ loading: false }, () => this.handleFetchDonations());
      });
    });
  }

  handleFetchDonations = () => {
    http.get('/fetch')
    .then((response) => {
      const { values } = response.data;
      const total = values.reduce((acc, value) => {
        return acc + Number(value[0]);
      }, 0);
      const count = values.length;
      this.setState({
        total,
        count,
      });
    });
  }

  render() {
    const percentageDonated = (this.state.total/ 1000) * 100;
    return (
      <div className="background">
        <div className="container">
        <div>
          <Tooltip placement="top" title={`$${1000 - this.state.total} Remaining`}>
            <Progress
              percent={percentageDonated}
              showInfo={false}
              strokeLinecap="square"
            />
          </Tooltip>
        </div>
        <div className="sub-container">
          <div className="donation-logo">
          <Icon style={{ fontSize: '80px', color: "purple" }} type="dollar" spin />
          </div>
          <div className="donation-board">
            <p>Join <span>{this.state.count}</span> other donors who have already supported this project. Every dollar helps</p>
            <div className="call-to-action">
              <InputNumber
                defaultValue={this.state.amount}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={this.onChange}
                disabled={this.state.total === 1000}
                min={0}
                max={1000}
              />
              <Button
                onClick={this.handleDonate}
                loading={this.state.loading}
                disabled={this.state.total === 1000}
              >
                DONATE
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export default App;
