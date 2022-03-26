import React, {Component, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import './App.css';
import {lockingTx} from "./profitSharing/profitSharing";
import {createConfig} from "./config/configs";

type State = {
  lockingTx: string,
  lockingAmount: number
}

const App: React.FC = () => {
    const [lockTx, setLockTx] = useState<string>("unknown")
    const [lockAmount, setLockAmount] = useState<number>(0)

    useEffect(() => {
        createConfig().then(c => window.config = c)
    }, []);

    const lock = (amount: number) => {
        lockingTx(2).then(res => setLockTx(res))
    }
    const onAmountChange = (e: any) => setLockAmount(e.target.value);

    return (
        <Container sx={{m: 5}}>
            <div>
                <Button variant="contained" sx={{m: 2}}
                        onClick={() => {lock(lockAmount)}}>
                    Lock Staking Tokens
                </Button>
                <TextField
                    onChange={() => onAmountChange}
                    sx={{m: 1}}
                    style={{width: 100}}
                    id="lock-amount"
                />
                <TextField
                    disabled
                    sx={{m: 1}}
                    style={{width: 600}}
                    id="outlined-address"
                    value={lockTx}
                />
            </div>
        </Container>
    );
}

class App2 extends Component<{}, State> {
  state: State = {
    lockingTx: 'unknown',
    lockingAmount: 0,
  };

  lock = (amount: number) => {
    lockingTx(2).then(res => this.setState({lockingTx: res}))
  }
  onAmountChange = (e: any) => this.setState(e.target.value);
  render() {
    return (
        <Container sx={{m: 5}}>
          <div>
            <Button variant="contained" sx={{m: 2}}
                    onClick={() => {this.lock(this.state.lockingAmount)}}>
                        Lock Staking Tokens
                      </Button>
            <TextField
                sx={{m: 1}}
                style={{width: 100}}
                id="lock-amount"
            />
            <TextField
                disabled
                sx={{m: 1}}
                style={{width: 600}}
                id="outlined-address"
                value={this.state.lockingTx}
            />
          </div>
        </Container>
    );
  }


}

export default App;
