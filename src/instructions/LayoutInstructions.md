This Layout is the entrypoint, and isIntro decides the route based component. We have already done the layout for homepage "/", for other components, I first you want to build the outer strucrture design and layout withut touching the internal design and code logic.

## What is present currently
- Left section contains the Sidebar
- Right Section contains the Header and the Outlet for the routed components.

## What to change
- First, both the sidebar and header will no longer be present attached to the screen as separate rectangles.
- Make them look like a separate card, with round border.
- Remove the carnot title as well as logo, and replace it with CARNOT in the sidebar as well as header.

## Sidebar UI (Vertical)
- As discussed it will be a card but with same options, as present already.
- Make it collapsable, and a arrow button at top to make it collapse and expand, default is collapase.
- When collapsed, only the icons will be visible, and when expanded, the text will also be visible.
- Add a specific hover animation and background color change on hovering for side-bar options.

## Header UI (Horizontal)
- Remove the CARNOT title and logo, and keep only USDT price section with updated UI.
- Everything including DEMO, CONNECT WALLET BUTTON, and USDT price section will be moved to the right section of header.
- Overall Header should like a floating card in the same way as sidebar, but it will not be collapsable, it will always be in expanded form.

## Color theme
- Use same theme as present in the homepage.
- Use Neon colors for icons, white for text, and proper hover.
- keep background of the sidebar and header as dark with some opacity, and add a blur effect to it as well.
- add small stars background in the sidebar and header, with very low opacity, to give it a spacey feel.
- You are free to use any external library for icons, animations, gradients, and hover effects, but make sure to follow the color theme and design guidelines as mentioned above.
- You can use material-ui, antd, framer-motion or any other library.

### Note
For current iteration, keep the Outlet component as it is, we will work on the internal design and code logic of the routed components in the next iterations. However, wrap it inside a card like structure, with round borders and proper padding, to make it look like a separate section from the header and sidebar.

### Strict Guidelines
- Do not change any other file not related to UI.
- Do nit change any code logic, only work on the UI and design part.
- Make sure to follow the color theme and design guidelines as mentioned above.
- Make sure to add animations, gradients and hover effects wherever specified, or neccessary as per your creativity without affecting the flow.
