'use client'
import { useState, useEffect } from "react"

import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import web3 from "@/utils/web3";
import { tokenContract } from "@/utils/token";
import {
    barlow_condensed,
    barlow,
    poppins_bold,
    poppins_regular
} from "./fonts"

import { GiBearFace } from "react-icons/gi";
import { FaEthereum } from "react-icons/fa";

export const HomeComp = () => {

    const [modal, setModal] = useState({ show: true, type: '' });
    const [msg, setMsg] = useState({ show: false, type: '', message: '' });
    const [balances, setBalances] = useState({ srt: '', eth: '', });
    const [inputs, setInputs] = useState({ email: '', pvtkey: '' });
    const [account, setAccount] = useState('');
    const [network, setNetwork] = useState(false);

    const importwallet = async (e) => {

        e.preventDefault();

        try {

            setMsg({ show: true, type: 'info', message: 'Loading...' });

            let pvtKey = inputs.pvtkey;
            if (!pvtKey.startsWith("0x")) {
                pvtKey = "0x" + pvtKey;
            }

            if (pvtKey.length !== 66) {
                setMsg({ show: true, type: 'error', message: 'Invalid Private Key length. Must be 64 characters (without 0x).' });
                setTimeout(() => {
                    setMsg({ show: false, type: '', message: '' });
                }, 3500);
                return;
            }

            const acc = web3.eth.accounts.privateKeyToAccount(pvtKey);

            setAccount(acc.address);

            const balanceWei = await web3.eth.getBalance(acc.address);
            const balanceEth = web3.utils.fromWei(balanceWei, "ether");
            const tokenBal = await tokenContract.methods.balanceOf(acc.address).call();
            const formattedBalance = web3.utils.fromWei(tokenBal, "ether");
            
            console.log(tokenBal);

            setBalances({ eth: balanceEth, srt: formattedBalance });
            setModal({ show: false, type: '' });

            setMsg({ show: true, type: 'success', message: 'Wallet Connected Successfully.' });
            setTimeout(() => {
                setMsg({ show: false, type: '', message: '' });
            }, 3500);

        } catch (err) {
            console.log(err);
            setMsg({ show: true, type: 'error', message: 'Something error occurred while connecting wallet.' });
            setTimeout(() => {
                setMsg({ show: false, type: '', message: '' });
            }, 3500);
        }

    };

    return (
        <div className="bg-[#0a254d] w-full h-full min-h-[100vh] relative">

            <div className="contain px-5 text-white space-y-8">

                {/* Nav */}
                <div className="w-full flex items-center my-auto py-5">

                    <div className="flex items-center my-auto space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-b from-sky-100 to-cyan-200 drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <GiBearFace className="text-[#0a254d] h-6 w-6" />
                            </span>
                        </div>

                        <div className={`${barlow} text-3xl drop-shadow-lg`}>
                            SRT
                        </div>
                    </div>

                </div>

                {/* Balances */}
                <div className="grid grid-cols-3 gap-6">

                    <div className="p-5 rounded-lg border-2 border-blue-400 w-full bg-white shadow-lg flex space-x-4 relative overflow-hidden">

                        <div className={`${balances.eth ? 'hidden' : 'absolute'} top-0 left-0 w-full h-full z-10 bg-white`}>
                            <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
                        </div>

                        <div className="h-20 w-20 rounded-full bg-[#0a254d] drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <FaEthereum className="text-white h-10 w-10" />
                            </span>
                        </div>

                        <div className={`${poppins_regular} space-y-2`}>

                            <div className={`text-xl drop-shadow-lg text-[#0a254d]`}>
                                ETH Balance
                            </div>

                            <div className="text-gray-700 font-semibold text-lg">
                                0.01
                            </div>

                        </div>

                    </div>

                    <div className="p-5 rounded-lg border-2 border-blue-400 w-full bg-white shadow-lg flex space-x-4 relative overflow-hidden">

                        <div className={`${balances.eth ? 'hidden' : 'absolute'} top-0 left-0 w-full h-full z-10 bg-white`}>
                            <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
                        </div>

                        <div className="h-20 w-20 rounded-full bg-[#0a254d] drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <GiBearFace className="text-white h-10 w-10" />
                            </span>
                        </div>

                        <div className={`${poppins_regular} space-y-2`}>

                            <div className={`text-xl drop-shadow-lg text-[#0a254d]`}>
                                SRT Balance
                            </div>

                            <div className="text-gray-700 font-semibold text-lg">
                                1.0
                            </div>

                        </div>
                    </div>

                </div>

            </div>

            <div className={`${poppins_regular} ${modal.show ? 'fixed h-[100vh] w-full bg-[#00000094] top-0 left-0 z-50' : 'hidden'}`}>

                <div className="absolute top-1/2 left-1/2 bg-white rounded-lg shadow-lg p-3 lg:p-5 focus:outline-none -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[65%] lg:min-w-[20%] lg:w-auto md:max-w-[80%]">

                    {modal.type == 'create' ?
                        <div>
                            create
                        </div> :
                        modal.type == 'import' ?
                            <div>
                                <div className={`${barlow} text-2xl font-semibold flex justify-center mx-auto text-center base-text border-b pb-4 mb-4`}>
                                    Import Your Wallet
                                </div>

                                <form onSubmit={importwallet} className="grid grid-cols-1 gap-4">

                                    <input
                                        type="name"
                                        className="field w-full"
                                        placeholder="Private Key of your wallet"
                                        value={inputs.pvtkey}
                                        onChange={(e) => setInputs({ ...inputs, pvtkey: e.target.value })}
                                        required
                                    />

                                    <div className="flex items-center justify-center m-auto space-x-3">
                                        <button type="submit" className="flex justify-center mx-auto btn1">
                                            Submit
                                        </button>
                                        <button type="button" onClick={() => setModal({ ...modal, type: '' })} className="flex justify-center mx-auto btn1">
                                            Back
                                        </button>
                                    </div>
                                </form>
                            </div> :
                            <div className="">
                                <div className={`${barlow} text-2xl font-semibold flex justify-center mx-auto text-center base-text border-b pb-4 mb-4`}>
                                    Connect Your Wallet
                                </div>
                                <div className="grid grid-cols-1 gap-4">

                                    <button onClick={() => setModal({ ...modal, type: 'create' })} className="btn1 w-fit flex justify-center mx-auto">Create Wallet</button>
                                    <button onClick={() => setModal({ ...modal, type: 'import' })} className="btn1 w-fit flex justify-center mx-auto">Import Wallet</button>

                                </div>
                            </div>
                    }

                </div>

            </div>

            <Snackbar
                open={msg.show}
                autoHideDuration={3000}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Alert variant="filled" severity={msg.type}>{msg.message}</Alert>
            </Snackbar>

        </div>
    )
}