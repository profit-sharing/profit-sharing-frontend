import React, {useRef, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import './App.css';
import {lockingTx, chargingTx, unlockingTx} from "./profitSharing/profitSharing";
import {BaseConfig} from "./config/configs";
import {ApiNetwork} from "./network/Network";
import ActionResult from "./components/actionResult";

const App: React.FC = () => {
    const [lockTx, setLockTx] = useState<string>("No Transaction")
    const [lockAmount, setLockAmount] = useState<number>(0)
    const [chargeTx, setChargeTx] = useState<string>("No Transaction")
    const [tokenCharge, setTokenCharge] = useState<string>("")
    const [chargeAmount, setChargeAmount] = useState<number>(0)
    const [unlockTx, setUnlockTx] = useState<string>("No Transaction")
    const [unlockToken, setUnlockToken] = useState<string>("")
    const [config, setConfig] = useState<BaseConfig|undefined>(undefined)

    useEffect(() => {
        ApiNetwork.getBackendConfig().then(conf => {
            setConfig(conf)
        })
    }, []);

    const lock = (amount: number) => {
        lockingTx(lockAmount, config!).then(res => setLockTx(res))
    }
    const charge = (reservedToken: string, amount: number) => {
        chargingTx(tokenCharge, chargeAmount*1e9, config!).then(setChargeTx)
    }
    const unlock = (reservedToken: string) => {
        unlockingTx(reservedToken, config!).then(setUnlockTx)
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
                    style={{width: 200}}
                    id="lock-amount"
                    label="stake amount"
                />
                <ActionResult txId={lockTx} />
            </div>
            <div>
                <Button variant="contained" sx={{m: 2}}
                        onClick={() => {charge(tokenCharge, chargeAmount)}}>
                    Charge your ticket
                </Button>
                <TextField
                    onChange={event => {
                        const {value} = event.target;
                        setChargeAmount(parseInt(value))
                    }}
                    sx={{m: 1}}
                    style={{width: 200}}
                    id="charge-amount"
                    label="amount (ERG)"
                />
                <TextField
                    onChange={event => {
                        const {value} = event.target;
                        setTokenCharge(value)
                    }}
                    sx={{m: 1}}
                    style={{width: 600}}
                    id="reserved-token-input"
                    label="reserved token id"
                />
                <ActionResult txId={chargeTx} />

            </div>
            <div>
                <Button variant="contained" sx={{m: 2}}
                        onClick={() => {unlock(unlockToken)}}>
                    Unlock staking tokens
                </Button>
                <TextField
                    onChange={event => {
                        const {value} = event.target;
                        setUnlockToken(value)
                    }}
                    sx={{m: 1}}
                    style={{width: 600}}
                    id="reserved-token-input2"
                    label="reserved token id"
                />
                <ActionResult txId={unlockTx} />
            </div>
        </Container>
    );
}

export default App;
