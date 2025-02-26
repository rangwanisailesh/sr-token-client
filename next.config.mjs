/** @type {import('next').NextConfig} */

const nextConfig = {
    env: {
        ALCHEMY_API: process.env.ALCHEMY_API,
        CONTRACT: process.env.CONTRACT,
        ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
        INFURA_API: process.env.INFURA_API,
        VERIFY: process.env.VERIFY
    }
};

export default nextConfig;
