import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import {
  MyToken,
  MyToken__factory,
  ERC20Votes,
  TokenizedBallot,
  TokenizedBallot__factory,
} from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["proposal1", "proposal2", "proposal3"];
const MINT_VALUE = ethers.parseEther("5");

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let i = 0; i < array.length; i++) {
    bytes32Array.push(ethers.encodeBytes32String(array[i]));
  }
  return bytes32Array;
}

describe("TokenizedBallot", function () {
  let tokenizedBallot: TokenizedBallot;
  let tokenContract: MyToken;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TokenContract = new MyToken__factory(owner);
    tokenContract = await TokenContract.deploy();

    const TargetTimePoint = (await ethers.provider.getBlockNumber()) + 10;

    const ProposalNames = convertStringArrayToBytes32(PROPOSALS);

    const TokenizedBallot = new TokenizedBallot__factory(owner);
    tokenizedBallot = await TokenizedBallot.deploy(
      convertStringArrayToBytes32(PROPOSALS),
      tokenContract,
      TargetTimePoint
    );
  });

  describe("Deployment", () => {
    it("has the provided proposals", async () => {
      for (let i = 0; i < PROPOSALS.length; i++) {
        const proposal = await tokenizedBallot.proposals(i);
        expect(ethers.decodeBytes32String(proposal.name)).to.equal(
          PROPOSALS[i]
        );
      }
    });

    it("has zero votes for all proposals", async () => {
      for (let i = 0; i < PROPOSALS.length; i++) {
        const proposal = await tokenizedBallot.proposals(i);
        expect(proposal.voteCount).to.equal(0);
      }
    });

    describe("when an account mints token", () => {
      beforeEach(async () => {
        const minTx = await tokenContract.mint(addr1.address, MINT_VALUE);
        await minTx.wait();
      });

      it("receive the correct amount of tokens", async () => {
        expect(await tokenContract.balanceOf(addr1.address)).to.equal(
          MINT_VALUE
        );
      });

      it("is charged with the correct amount of ETH", async () => {
        expect(await ethers.provider.getBalance(addr1.address)).to.equal(
          ethers.parseEther("10000")
        );
      });

      it("has the correct voting power", async () => {
        const votingPower = await tokenContract.getVotes(addr1.address);
        expect(votingPower).to.equal(0);
      });
    });

    describe("delegating account", () => {
      let votingPower: any;
      beforeEach(async () => {
        const delegateTx = await tokenContract
          .connect(addr1)
          .delegate(addr2.address);
        await delegateTx.wait();
        votingPower = await tokenContract.getVotes(addr2.address);
      });

      it("has the correct voting power", async () => {
        expect(votingPower).to.equal(0);
      });
    });
  });
});
