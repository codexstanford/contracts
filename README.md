# Hospital cash contracts

Sample insurance contracts providing hospital cash benefits, for use in [CodeX's IPM prototype](http://insurance.stanford.edu/insurance/hospitalcash/).

## Questions

How should we characterize the relationship between actual policies, as in the actual agreement between insurer and insuree, versus prototypical "form" policies, e.g. AF9100CA? It would be nice to be able to write `covers(af9100, Hospitalization)`, but we can't actually do that, because whether *your particular* AF9100CA covers a hospitalization depends on when you signed it. I see a couple of options:
- `covers(af9100, Policy, Hospitalization)`: Keep the "prototype" of the policy separate from data about its instantiation. A bit verbose. This is what I've done for now.
- `covers(Policy, Hospitalization)` plus `policy.form(Policy, af9100)`: Make the form policy an attribute of the actual policy. Not sure how this would play with modular policies.