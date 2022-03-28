import React, {useRef, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import './App.css';
import {lockingTx} from "./profitSharing/profitSharing";
import {BaseConfig} from "./config/configs";
import {ApiNetwork} from "./network/Network";


const App: React.FC = () => {
    const [lockTx, setLockTx] = useState<string>("unknown")
    const [lockAmount, setLockAmount] = useState<number>(0)
    const [config, setConfig] = useState<BaseConfig|undefined>(undefined)

    useEffect(() => {
        ApiNetwork.getBackendConfig().then(conf => {
            setConfig(conf)
        })
    }, []);

    const lock = (amount: number) => {
        lockingTx(lockAmount, config!).then(res => setLockTx(res))
    }
    return (
        <Container sx={{m: 5}}>
            <div>
                <Button variant="contained" sx={{m: 2}}
                        onClick={() => {lock(lockAmount)}}>
                    Lock Staking Tokens
                </Button>
                <TextField
                    onChange={event => {
                        const {value} = event.target;
                        setLockAmount(parseInt(value))
                    }}
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

export default App;
