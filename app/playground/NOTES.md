# NOTES.md

I built my own Modal, Tabs, and Disclosure by hand, then installed
shadcn/ui and added its dialog and tabs. Here's what I noticed shadcn
does that mine doesn't.

## Modal

- In my version, after clicking the modal button and the popup
  appeared, you could still scroll the page behind it, which feels
  weird. 
  Shadcn's version doesn't let you do that.The page is
  locked and only the dialog is interactive.

- In my version, when the modal is closed it disappears instantly.
  Shadcn's version does a small fade-out animation on close, and only
  after the animation finishes does focus jump back to the button
  that opened it.

- Shadcn's version also hides the rest of the page from screen
  readers while the dialog is open.
  Mine only blocks keyboard users from tabbing out — a screen reader
  could still read the content behind, which isn't great.

## Tabs

- My tabs only support left/right arrow keys because I coded
  them to be horizontal. 
  Shadcn's tabs also support a vertical layout where up/down arrow keys move between tabs, 
  which mine wouldn't handle.

- Shadcn's tabs also skip over any tab that's disabled when you
  press the arrow keys.
  My version doesn't have a concept of a disabled tab, so if I ever added one it would still be focusable and would break the flow.
