import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import TokenizedBallotJSON from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import * as dotenv from "dotenv";

dotenv.config();

let provider: ethers.JsonRpcProvider;

function setupProvider() {
  provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL ?? "");
  return provider;
}

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  const tokenizedBallotContract = new ethers.Contract(
    process.env.TOKENIZED_BALLOT_ADDRESS ?? "",
    TokenizedBallotJSON.abi,
    signer
  );
  const tokenFactory = new MyToken__factory(signer);
  const tokenContract = tokenFactory.attach(process.env.TOKEN_ADDRESS ?? "");

  const votes = await tokenizedBallotContract.votingPower(signer.address);
  console.log(`\nYou have ${votes} votes.\n`);

  const delegateTx = await tokenContract
    .connect(signer)
    .delegate(signer.address);
  await delegateTx.wait();

  const votesAfter = await tokenizedBallotContract.vote(signer.address);
  console.log(`\nYou have ${votesAfter} votes.\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
