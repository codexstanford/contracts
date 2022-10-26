# Hospital cash contracts

Sample insurance contracts providing hospital cash benefits, for use in [CodeX's IPM prototype](http://insurance.stanford.edu/insurance/hospitalcash/).

## Structure

`core.epilog` contains common rules shared between contracts.

`metadata.epilog` describes the expected input data.

`templates.epilog` contains templates for generating English from query results.

Each subfolder corresponds to a particular contract, containing:
- One or more PDFs that contain the actual contract provisions in natural language
- `rules.epilog`, where the rules representing the contract are encoded
- `data.epilog` (maybe), which contains a sample data set

## Questions

LifeSecure and Aflac define hospital confinement somewhat differently, and I'm not sure how to or to what extent we want to reconcile them.
- LifeSecure says "The assignment to a bed as a resident Inpatient in a Hospital and be at the direction of and under the supervision of a Physician. Observation, emergency or outpatient rooms are not considered Confinement."
- Aflac says "a stay of a Covered Person confined to a bed in a Hospital for 23 or more hours for which a room charge is made. The Hospital Confinement must be on the advice of a Physician, Medically Necessary, and the result of a covered Sickness or Accidental Injury. Treatment or confinement in a U.S. government Hospital does not require a charge for benefits to be payable."

How should we characterize the relationship between actual policies, as in the actual agreement between insurer and insuree, versus prototypical "form" policies, e.g. AF9100CA? It would be nice to be able to write `covers(af9100, Hospitalization)`, but we can't actually do that, because whether *your particular* AF9100CA covers a hospitalization depends on when you signed it. I see a few options:
- `covers(af9100, Hospitalization)` plus `policy.startdate(af9100, 01_01_2021)`: Forget about this distinction entirely, and treat all policies as concrete. This is the easiest thing for now.
- `covers(af9100, Policy, Hospitalization)`: Keep the "prototype" of the policy separate from data about its instantiation. A bit verbose. This is what I tried in 331e7a8.
- `covers(Policy, Hospitalization)` plus `policy.form(Policy, af9100)`: Make the form policy an attribute of the actual policy. Not sure how this would play with modular policies.