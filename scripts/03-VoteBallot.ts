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
  const tokenizedBallot_address = process.env.TOKENIZED_BALLOT_ADDRESS ?? "";

  const proposalId = process.argv[2];
  console.log(`\nVoting for proposal ${proposalId}.`);

  const votingAmount = Number(process.argv[3]);

  if (votingAmount < 0) {
    throw new Error("Amount must be positive");
  }

  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`\nWallet balance ${balance}.`);
  if (balance < 0.01) {
    throw new Error("Not enough ether.");
  }

  const tokenizedBallotContract = new ethers.Contract(
    tokenizedBallot_address,
    TokenizedBallotJSON.abi,
    signer
  );

  await tokenizedBallotContract.vote(proposalId, votingAmount, {
    gasLimit: 1000000,
  });

  const votedProposal = await tokenizedBallotContract.proposals(proposalId);
  console.log(
    `\nVoted proposal ${
      votedProposal.name
    } with ${await votedProposal.voteCount} votes.`
  );
  console.log(`Wallet balance ${balance}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
