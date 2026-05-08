# Update the WorklowFeatures content based on the following instructions:
1. `Architecture.md` has the complete architecture of the service, which can be used for the reference, understanding the context, and what is used where.

## Heading and Sub Heading Content:
Should Reflect the workflow section. This section includes various backend processes that come together to make the trade successful ensuring intergrity.

## Cards - Subsections of Workflow:
1. Real time Price Feed and Order Settlement: Real time price feed using Binance WebSocket. PriceService tick keep checking the price update and immediate emit outcome event. Both price feed and settlement on web socket.
2. Batch Assembly (Worker): An independent background process that assembles settled orders every minute into batches.
3. ZK Proof Generation (Keeper): Find unprocessed batches and generate zk proofs for them using SP1 VM, Groth16. Then request on-chain settlement on Solana.
4. On-Chain Settlement (Solana PDAs): After proof generation, the keeper will submit the proof to the Solana program to settle the batch on-chain, ensuring the integrity and finality of the trades. Verifies Groth16 proof on-chain, Creates nullifier PDA to mark batch as settled, Creates batch_receipt PDA recording merkle_root, Emits settlement event. Use of Aggregator circuits for efficient proof generation, and saving gas fees.

### Note
1. Abobe content is a suggestion or hints of what to pick and what not, but you can add or remove some content if its not relevant.
2. Relevancy of content must only be decided based on the `Architecture.md` file, which is the base reference and must be followed.
3. You have to understand the file and then provide the relevant card content (left section card of overall right section).
4. Content should be clean, to the point, should include techinal descriptions, and look like a documentation and pitch of the workflow section.
5. Better if you divide the content into sections and subsections, and use bullet points where necessary to make it more readable.
6. Avoid using over technical jargons, but still keep the content technical and informative.
7. Also update the icons in the end where-ever required in the subsection.
