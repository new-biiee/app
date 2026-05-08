## Context
`LiquidityPoolView.tsx` has a similar structure to `WalletView.tsx`. It has 5 Cards with name: "Your LP Shares", "POSITION (USDT)", "Pool Shares", "Withdraw Unlock", and "Pool Total Deposited". Right section has "Depoist/Withdraw Activity". You have to modify each section.

## Reference
Refer to `WalletView.tsx` for the design and layout changes that I have just done.

## Your task
You have to change the design and layout in the below steps. Each section is a separate row.

### Section 1
This must include these cards: "Your LP Shares", "Pool Shares", and "Pool Total Deposited". All these cards must be in one column, and right column must have a pie-chart showing the Pool Share distribution. Use `Chart.js` for the pie-chart and use the existing color theme of the app for the chart colors.

### Section 2
This must include these cards: "POSITION (USDT)" and "Withdraw Unlock". Both these cards must be in one row, and two columns. These two cards must look similar with respect to each other but different from Section 1, so that two sections seem different.

## Section 3
This must include "Deposit/Withdraw Activity". You have to copy the exact design pattern followed by the same section in `WalletView.tsx`. You have to import the same card design however vector image can be different based on th topic.
Also only design must be followed, while internal logic and functionality must not be changed and preserved strictly.

## Instructions
1. You have to only change the design and layout of the components, do not change any functionality or logic.
2. do not change any existing code, python function, fetch/ update function.
3. You must change design only.
4. Must follow the existing color theme and style of the app, do not introduce new colors or fonts.
