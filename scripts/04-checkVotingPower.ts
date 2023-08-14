import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("1");

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL ?? ""
  );
  return provider;
}

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  const tokenFactory = new MyToken__factory(signer);
  const tokenContract = tokenFactory.attach(
    process.env.TOKEN_ADDRESS ?? ""
  ) as MyToken;

  const votesAfter = await tokenContract.getVotes(signer.address);
  console.log(
    `Account ${
      signer.address
    } has ${votesAfter.toString()} units of voting power \n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
