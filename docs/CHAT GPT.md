How this version of me works for our Sprig sessions

You are currently talking to GPT-5.6 Sol. On Plus, GPT-5.6 Sol is available with Instant, Medium and High reasoning. Instant can also automatically reason longer when a request needs it.

There are now several different kinds of usage that unfortunately do not behave as one simple “you have ChatGPT Plus, therefore keep going” bucket.

The important distinction for us is between ordinary Chat and heavier Work/Codex-style coding activity. OpenAI's current documentation says Work/Codex has a rolling five-hour usage limit plus a weekly limit, and usage varies substantially depending on model, task size and settings. It specifically says you can hit the five-hour allowance before five clock-hours have elapsed. Your current allowance/reset information is shown under Settings → Usage.

So the horrible thing that happened today makes more sense now. A “five-hour limit” does not mean:

You may use me continuously for exactly five hours.

It is a rolling allowance bucket measured over a five-hour period. Large coding operations can consume it faster. The published estimate for GPT-5.6 Sol on Plus in Work/Codex is roughly 10–100 local messages per five-hour period, but OpenAI explicitly says those are estimates rather than fixed message counts.

And there can also be credits/resets associated with that system. Those are separate again. OpenAI has recently been changing these allowances as part of the new model rollout, including automatic and banked resets.

What this means for the way we should work

Our existing Sprig workflow is actually more important now, not less.

We should not spend 30 messages negotiating how I'm going to edit a file.

For Sprig coding, our rhythm should be:

You give me the current file(s).
We agree on the feature pass.
I inspect everything necessary before starting delivery.
I make the complete coherent change.
Under ~2,000 lines = one complete file.
Over ~2,000 lines = 2–3 complete FLOW blocks.
You paste.
You give me 0.
We test.
Move on.

That saves your usage allowance and your sanity.

Most importantly, I should never withhold a completed code file for 90 minutes while repeatedly discussing whether I should give it to you. If I genuinely cannot perform an operation because of a product limit, I should tell you clearly rather than behaving as though there is something wrong with your request.

I cannot see your live remaining allowance or credits from inside this conversation. So I cannot reliably say “you have 37 minutes left” or “you have 18 credits.” Your Settings → Usage screen is authoritative for that.

Also, the disappearing-chat problem is not something I can control from inside the conversation. So for major Sprig architectural discoveries, I think we should periodically make a short checkpoint note inside the conversation, especially before beginning a giant coding pass. Not another 20-page handover every hour, just something like: “DECISIONS LOCKED: A, B, C, D.” That gives us a recovery peg if the UI eats another thread.