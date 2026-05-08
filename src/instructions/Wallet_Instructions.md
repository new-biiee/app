## Context
In the `WalletView.tsx`, there are 3 sections: Wallet USDT Balance, Protocol USDT Balance, and (Deposit/Withdraw Activity). You have to modify each section.

### Wallet USDT Balance and Protocol USDT Balance
1. Current they are two rows, make them into one column.
2. For Wallet USDT, make it look like a credit or debit card, like one seen in the Finance app. It should have the USDT logo, the balance, and the wallet address.
3. Wallet address must be hidden or password protected, with an option (eye icon) to reveal it.
4. For Protocol USDT, make it look like a card as well, but with a different design to distinguish it from the Wallet USDT card. It should also have the USDT logo and the balance. Better to add a Protocl based icon from lucide icons to represent the protocol.

### Deposit/Withdraw Activity
1. Move Deposit/Withdraw Activity section below the two balance cards and to the right side.
2. On the left side import a card design or vector image which change based on the active section (Deposit or Withdraw).
3. Update the design structure of Deposit/Withdraw Activity to have a more modern and clean look. Use a card layout with clear sections for each activity, including icons, timestamps, and amounts.

## Must follow instructions
1. You have to only change the design and layout of the components, do not change any functionality or logic.
2. do not change any existing code, python function, fetch/ update function.
3. You must change design only.
4. Must follow the existing color theme and style of the app, do not introduce new colors or fonts.