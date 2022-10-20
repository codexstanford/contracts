# Hospital cash contracts

Sample insurance contracts providing hospital cash benefits, for use in [CodeX's IPM prototype](http://insurance.stanford.edu/insurance/hospitalcash/).

## Questions

How should we characterize the relationship between actual policies, as in the actual agreement between insurer and insuree, versus prototypical "form" policies, e.g. AF9100CA? It would be nice to be able to write `covers(af9100, Hospitalization)`, but we can't actually do that, because whether *your particular* AF9100CA covers a hospitalization depends on when you signed it. I see a few options:
- `covers(af9100, Hospitalization)` plus `policy.startdate(af9100, 01_01_2021)`: Forget about this distinction entirely, and treat all policies as concrete. This is the easiest thing for now.
- `covers(af9100, Policy, Hospitalization)`: Keep the "prototype" of the policy separate from data about its instantiation. A bit verbose. This is what I tried in 331e7a8.
- `covers(Policy, Hospitalization)` plus `policy.form(Policy, af9100)`: Make the form policy an attribute of the actual policy. Not sure how this would play with modular policies.