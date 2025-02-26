import Web3 from "web3";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { tokenContract } from "@/utils/token";
dotenv.config();

const web3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API}`));

export async function POST(req) {
    try {
        const body = await req.json();
        const { pvtKey } = body;

        if (!pvtKey) {
            return NextResponse.json({ error: 'Invalid private key' })
        }
        const PRIVATE_KEY = pvtKey;
        const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);

        // 🔹 Check ETH balance
        const balanceWei = await web3.eth.getBalance(account.address);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");

        if (parseFloat(balanceEth) <= 0.003) {  // Approximate gas cost
            return NextResponse.json({ error: "Not enough ETH for gas. Fund your wallet with Sepolia ETH." });
        }

        const feeData = await web3.eth.getBlock("latest");
        const baseFee = feeData.baseFeePerGas;
        const maxPriorityFeePerGas = web3.utils.toWei("3", "gwei");
        const maxFeePerGas = (BigInt(baseFee) + BigInt(maxPriorityFeePerGas)).toString();

        // 🔹 Prepare Transaction (EIP-1559 Format)
        const txData = tokenContract.methods.faucet(account.address);
        const txObject = {
            from: account.address,
            to: tokenContract.options.address,
            gas: 500000,
            maxPriorityFeePerGas: maxPriorityFeePerGas, // ✅ EIP-1559 Fee
            maxFeePerGas: maxFeePerGas, // ✅ EIP-1559 Fee
            data: txData.encodeABI(),
            type: "0x2", // ✅ Explicitly mark as EIP-1559 transaction
        };

        // 🔹 Sign Transaction
        const signedTx = await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY);

        // 🔹 Send Signed Transaction
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return NextResponse.json({ success: `Claimed TXid: ${txReceipt.transactionHash}`, txHash: txReceipt.transactionHash });
    } catch (err) {
       return NextResponse.json({ error: err.message, err });
    }
}
