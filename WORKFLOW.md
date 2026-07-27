## Workflow file

In this file I will document the differences between the 2 rounds.

1)  Round 2 included specific visual details I asked for: oval shaped input
    fields, dark blue camel case field labels, a background colour, and a
    greeting message at the top of the page. 
    Round 1 had none of these, since the prompt i gave it was very vague and had 
    no instructions about the visual part.It used default browser styling
    with plain black text labels.

2) Round 1 interpreted "settings form" as needing a "Username" field,
   which accepts letters and numbers together (e.g. "Kyriaki123"),
   with no rejection shown. 
   Round 2 instead built a "Full Name" field,as I specified, which correctly rejected 
   "Kyriaki123" with the message "Full name cannot contain numbers or special characters." 

3) Round 2 has a dropdown menu with four options (Daily, Weekly, Monthly,
   Never), since I specified these exact choices. 
   Round 1 only used a simple checkbox, which can only represent two states.

4) In Round 1, if a field fails a validation rule, every field turns red
   and shows all its error messages at once, even fields the user hasn't touched yet.
   Round 2 avoided this because I explicitly specified that errors 
   should only appear after a field is touched or if the user attempts to submit the form.

5) Round 1 seemed fast at first, since the prompt itself took seconds to
   write. However, I lost time afterward because I hadn't specified where
   the files should be saved, and Claude saved them in the wrong folder,
   so I had to manually locate and move them myself.

6) Round 2 took longer to write the prompt itself, but the resulting code
   worked immediately and came with passing tests.

7) I tested navigating only with the keyboard without using the mouse on both versions. 
   Using the Tab button worked correctly in both. 
   In Round 1, the checkbox correctly changed  with the Spacebar. 
   In Round 2, the dropdown worked correctly using Tab and arrow keys. 
   Both versions basically passed this basic accessibility check.

8) I also tested resizing the browser window on both versions. 
   In Round 2, both the outer container and the individual input fields 
   resized smoothly to fit the new window size, as I had specifically asked for. 
   In Round 1, only the outer container box resized whereas the individual input fields
   stayed a fixed size and did not adjust, since I never specified
   responsive behaviour in the lazy prompt.