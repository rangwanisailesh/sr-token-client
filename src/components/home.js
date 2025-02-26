'use client'
import { useState, useEffect } from "react"
import axios from "axios";
import jwt from "jsonwebtoken";
require('dotenv').config();

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
import { PiWalletFill } from "react-icons/pi";
import { FaRegClipboard } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";

export const HomeComp = () => {

    const [modal, setModal] = useState({ show: true, type: '' });
    const [msg, setMsg] = useState({ show: false, type: '', message: '' });
    const [balances, setBalances] = useState({ srt: '', eth: '', });
    const [inputs, setInputs] = useState({ email: '', pvtkey: '' });
    const [account, setAccount] = useState('');
    const [pvtKey, setPvtKey] = useState('');
    const [userbox, setUserbox] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    const importwallet = async (e) => {

        e.preventDefault();

        try {

            setMsg({ show: true, type: 'info', message: 'Loading...' });

            let prvtKey = inputs.pvtkey;
            if (!prvtKey.startsWith("0x")) {
                prvtKey = "0x" + prvtKey;
            }

            if (prvtKey.length !== 66) {
                setMsg({ show: true, type: 'error', message: 'Invalid Private Key length. Must be 64 characters (without 0x).' });
                setTimeout(() => {
                    setMsg({ show: false, type: '', message: '' });
                }, 3500);
                return;
            }

            const acc = web3.eth.accounts.privateKeyToAccount(prvtKey);

            const gettoken = await axios.post('/api/token',
                {
                    pvtkey: prvtKey,
                    address: acc.address
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const token = gettoken.data;

            if (token.token) {
                localStorage.setItem("SRT Token", token.token);
            }

            setAccount(acc.address);
            setPvtKey(prvtKey);

            const balanceWei = await web3.eth.getBalance(acc.address);
            const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, "ether")).toFixed(4);
            const tokenBal = await tokenContract.methods.balanceOf(acc.address).call();
            const formattedBalance = web3.utils.fromWei(tokenBal, "ether");

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

    const createWallet = async () => {

        const wallet = web3.eth.accounts.create();

        if (wallet.address) {
            setAccount(wallet.address);
            setPvtKey(wallet.privateKey);
            setModal({ show: true, type: 'create' })

            const gettoken = await axios.post('/api/token',
                {
                    pvtkey: wallet.privateKey,
                    address: wallet.address
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const token = gettoken.data;

            if (token.token) {
                localStorage.setItem("SRT Token", token.token);
            }

            const balanceWei = await web3.eth.getBalance(wallet.address);
            const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, "ether")).toFixed(4);
            const tokenBal = await tokenContract.methods.balanceOf(wallet.address).call();
            const formattedBalance = web3.utils.fromWei(tokenBal, "ether");

            setBalances({ eth: balanceEth, srt: formattedBalance });

            setMsg({ show: true, type: 'success', message: 'Wallet Connected Successfully.' });
            setTimeout(() => {
                setMsg({ show: false, type: '', message: '' });
            }, 3500);
        }
    };

    const copytoclipboard = (add) => {
        navigator.clipboard.writeText(add);
        setMsg({ show: true, type: 'success', message: 'Copied' });
        setTimeout(() => {
            setMsg({ show: false, type: '', message: '' });
        }, 3500);
    };

    const refresh = async () => {
        setMsg({ show: true, type: 'info', message: 'Updating Balances...' });
        const balanceWei = await web3.eth.getBalance(account);
        const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, "ether")).toFixed(4);
        const tokenBal = await tokenContract.methods.balanceOf(account).call();
        const formattedBalance = web3.utils.fromWei(tokenBal, "ether");

        setBalances({ eth: balanceEth, srt: formattedBalance });
        setModal({ show: false, type: '' });

        setRemainingTime(0);
        fetchLastClaimTime();
        setMsg({ show: true, type: 'success', message: 'Balances Updated Successfully.' });
        setTimeout(() => {
            setMsg({ show: false, type: '', message: '' });
        }, 3500);
    };

    const faucet = async () => {

        setMsg({ show: true, type: 'info', message: 'Claiming Token' });

        const res = await axios.post('/api/faucet', { pvtKey: pvtKey },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = res.data;

        if (data.success) {
            setMsg({ show: true, type: 'success', message: data.success });
            refresh();
            fetchLastClaimTime();
            setTimeout(() => {
                setMsg({ show: false, type: '', message: '' });
            }, 3500);
        } else {
            setMsg({ show: true, type: 'error', message: data.error || 'Something error occured.' });
            setTimeout(() => {
                setMsg({ show: false, type: '', message: '' });
            }, 3500);
        }
    };
    
    const fetchLastClaimTime = async () => {
        try {
            const lastClaim = await tokenContract.methods.lastFaucetClaim(account).call();

            const lastClaimTime = parseInt(lastClaim);

            if (lastClaimTime > 0) {
                const nextClaimTime = lastClaimTime + 6 * 60 * 60;
                const now = Math.floor(Date.now() / 1000);
                const timeLeft = Math.max(nextClaimTime - now, 0);
                setRemainingTime(timeLeft);
            }
        } catch (err) {
            console.error("Error fetching last claim time:", err);
        }
    };

    useEffect(() => {

        const token = localStorage.getItem('SRT Token');
        const decode = jwt.decode(token, process.env.VERIFY);

        if (!decode || !decode.address || !decode.pvtkey) {
            localStorage.removeItem('SRT Token');
            return;
        }

        const connectwallet = async () => {

            try {
                setAccount(decode.address);
                setPvtKey(decode.pvtkey);

                const balanceWei = await web3.eth.getBalance(decode.address);
                const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, "ether")).toFixed(4);
                const tokenBal = await tokenContract.methods.balanceOf(decode.address).call();
                const formattedBalance = web3.utils.fromWei(tokenBal, "ether");

                setBalances({ eth: balanceEth, srt: formattedBalance });
                setModal({ show: false, type: '' });

                setMsg({ show: true, type: 'success', message: 'Wallet Connected Successfully.' });
                setTimeout(() => {
                    setMsg({ show: false, type: '', message: '' });
                }, 3500);
            } catch (err) {
                console.log(err);
                localStorage.removeItem('SRT Token');
            }

        };

        if (decode.address && decode.pvtkey) {
            connectwallet();
        }

    }, []);

    useEffect(() => {
        if (remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [remainingTime]);

    useEffect(() => {
        if (!account) return;

        if (account) {
            setRemainingTime(0);
            fetchLastClaimTime();
        }
    }, [account]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-[#0a254d] w-full h-full min-h-[100vh] relative">

            <div className="contain px-5 text-white space-y-8 pb-10">

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

                    <div className="flex justify-end w-full duration-300 relative">
                        <button onClick={() => refresh()} className="h-10 w-10 rounded-full border-2 border-blue-400 bg-gradient-to-r from-sky-100 to-sky-300 hover:scale-[105%] duration-300 text-blue-700 mr-2">
                            <span className="flex justify-center items-center m-auto h-full">
                                <IoReload />
                            </span>
                        </button>

                        <button onClick={() => setUserbox(!userbox)} className="h-10 w-10 rounded-full border-2 border-blue-400 bg-gradient-to-r from-sky-100 to-sky-300 hover:scale-[105%] duration-300 text-blue-700">
                            <span className="flex justify-center items-center m-auto h-full">
                                <FaUser />
                            </span>
                        </button>

                        <div className={`${userbox && account ? 'absolute top-12 right-0 bg-white shadow-lg p-5 rounded-lg duration-300 z-40' : 'hidden duration-300'}`}>
                            <button onClick={() => { copytoclipboard(account); setUserbox(false); }} className="flex items-center my-auto space-x-2 text-black border-b pb-2 mb-2 hover:scale-[105%] duration-300 w-full">
                                <IoWalletOutline className="text-xl text-blue-600" />
                                <span className="inline">{account.slice(0, 6)}...{account.slice(-4)}</span>
                            </button>
                            <button onClick={() => {
                                setBalances({ srt: '', eth: '', });
                                setAccount('');
                                setModal({ show: true, type: '' });
                                setPvtKey('');
                                setInputs({ email: '', pvtkey: '' });
                                setUserbox(false);
                            }} className="flex items-center my-auto space-x-2 pb-2 text-black hover:scale-[105%] duration-300">
                                <IoMdExit className="text-xl text-blue-600" />
                                <span className="inline">Exit</span>
                            </button>

                            <button onClick={() => { copytoclipboard(pvtKey); setUserbox(false); }} className="btn1 flex justify-center mx-auto">
                               Private Key
                            </button>
                        </div>
                    </div>

                </div>

                {/* Balances */}
                <div className="lg:flex items-center my-auto grid md:grid-cols-2 grid-cols-1 gap-6">

                    <div className="p-5 rounded-lg border-2 border-blue-400 w-full bg-white shadow-lg flex space-x-4 relative overflow-hidden">

                        <div className={`${balances.eth ? 'hidden' : 'absolute'} top-0 left-0 w-full h-full z-10 bg-white`}>
                            <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
                        </div>

                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#0a254d] drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <FaEthereum className="text-white h-8 w-8 md:h-10 md:w-10" />
                            </span>
                        </div>

                        <div className={`${poppins_regular} space-y-2`}>

                            <div className={`md:text-xl drop-shadow-lg text-[#0a254d]`}>
                                Sepolia ETH Balance
                            </div>

                            <div className="text-gray-700 font-semibold md:text-lg">
                                {balances.eth}
                            </div>

                        </div>

                    </div>

                    <div className="p-5 rounded-lg border-2 border-blue-400 w-full bg-white shadow-lg flex space-x-4 relative overflow-hidden">

                        <div className={`${balances.eth ? 'hidden' : 'absolute'} top-0 left-0 w-full h-full z-10 bg-white`}>
                            <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
                        </div>

                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#0a254d] drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <GiBearFace className="text-white h-8 w-8 md:h-10 md:w-10" />
                            </span>
                        </div>

                        <div className={`${poppins_regular} space-y-2`}>

                            <div className={`md:text-xl drop-shadow-lg text-[#0a254d]`}>
                                SRT Balance
                            </div>

                            <div className="text-gray-700 font-semibold md:text-lg">
                                {balances.srt}
                            </div>

                        </div>
                    </div>

                </div>

                {/* Note */}
                <div className={`${poppins_regular}`}>
                    SRT Token Contract (Running on Sepolia Network) : <a href="https://sepolia.etherscan.io/address/0xF3bd2E8787111E62EC29EEd6a94874320a1586CE" target="_blank" className="underline underline-offset-3">0xF3bd2...86CE</a>
                    <br /><br />
                    You can claim tokens after every 6 hours. For claiming SRT token you must have atleast 0.01 test Eth (sepolia Eth in your wallet). Copy your wallet address by clicking on wallet address from your profile and mail your wallet address for free test ETH on <a className="font-semibold underline underline-offset-3" href="mailto:s.rangwani44@gmail.com">s.rangwani44@gmail.com</a> .
                </div>

                {/* faucet */}
                <div className="flex justify-center mx-auto">
                    <button
                        className={`${remainingTime !== 0 ? 'bg-gray-500' : ''} btn1`}
                        onClick={() => faucet()}
                        disabled={remainingTime !== 0}
                    >
                        {remainingTime !== 0 ? `Claim After ${formatTime(remainingTime)}` : 'Claim 1 SRT'}
                    </button>
                </div>

            </div>

            {/* Modal */}
            <div className={`${poppins_regular} ${modal.show ? 'fixed h-[100vh] w-full bg-[#00000094] top-0 left-0 z-50' : 'hidden'}`}>

                <div className="absolute top-1/2 left-1/2 bg-white rounded-lg shadow-lg p-3 lg:p-5 focus:outline-none -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[65%] lg:min-w-[20%] lg:w-auto lg:max-w-[30%] md:max-w-[80%]">

                    {modal.type == 'create' ?
                        <div>
                            <div className={`${barlow} text-2xl font-semibold flex justify-center mx-auto text-center base-text border-b pb-4 mb-4`}>
                                Wallet Credentials
                            </div>

                            <div className="text-center flex justify-center mx-auto">
                                Please copy your new wallet Credentials.
                            </div>

                            <div className="my-2">
                                <span className="font-semibold">Address : </span><span className="inline">{account.slice(0, 6)}...{account.slice(-4)}</span> <button onClick={() => copytoclipboard(account)} className="text-blue-500 hover:text-blue-800"><FaRegClipboard /></button>
                            </div>

                            <div className="my-2">
                                <span className="font-semibold">Private Key : </span><span className="inline">{pvtKey.slice(0, 6)}...{pvtKey.slice(-4)}</span> <button onClick={() => copytoclipboard(pvtKey)} className="text-blue-500 hover:text-blue-800"><FaRegClipboard /></button>
                            </div>

                            <div className="my-2">
                                <span className="text-red-500">*</span> Please Copy your Private Key and store this anywhere. So you can use this wallet anywhere.
                            </div>

                            <button type="button" onClick={() => setModal({ show: false, type: '' })} className="flex justify-center mx-auto btn1">
                                Close
                            </button>
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

                                    <button onClick={() => createWallet()} className="btn1 w-fit flex justify-center mx-auto">Create Wallet</button>
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