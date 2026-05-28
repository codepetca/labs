# AI Guidelines

AI is expected in Codepet Labs work. It should raise the quality and speed of
learning, not hide weak understanding.

For AI coding-agent session routing, use [`docs/ai-instructions.md`](ai-instructions.md)
after [`.ai/START-HERE.md`](../.ai/START-HERE.md).

## Use AI For

- Exploring implementation options.
- Drafting concise UI copy and documentation.
- Generating first-pass code for small, reviewable changes.
- Debugging with clear reproduction steps.
- Reviewing code for edge cases.
- Learning unfamiliar APIs.

## Verify Everything

Students are responsible for the final work they submit.

- Read generated code before committing it.
- Run the app locally when behavior changes.
- Run lint and build checks for code or UI changes.
- Test the main user flow.
- Remove unused code and fake complexity.
- Be able to explain important decisions.

## Keep The Boundary Clear

- Build with mock data first.
- Say when a demo is fake, partial, or exploratory.
- Do not use production student data.
- Do not request or imply unsupervised production Pika access.
- Do not add new auth, databases, or integrations unless the project explicitly
  calls for them.
- Keep WorkOS usage limited to the documented Labs membership flow.

## Do Not Use AI For

- Inventing fake production behavior.
- Copying private code, credentials, or real student data into external tools.
- Submitting work you do not understand.
- Adding complexity that cannot be explained in review.

## Agent Standard

AI-assisted work should be clear, tested, and explainable. If generated code or
copy is confusing, simplify it before asking for review.

For UI work, follow [UI/UX Style Guide](ui-ux-style.md): mobile-first, minimal,
low-text, and mock-data-first.
