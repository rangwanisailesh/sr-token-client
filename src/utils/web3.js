import Web3 from "web3";
require('dotenv').config();

let web3;

if(typeof window !== "undefined" && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API}`));
    web3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API}`));
}

export default web3;