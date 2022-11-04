import * as epilog from '@epilog/epilog';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import test from 'node:test';

const __dirname = new URL('.', import.meta.url).pathname;

const ruleset = [];
const dataset = [];

await Promise.all([
  fs.readFile(path.join(__dirname, '../core.epilog'), { encoding: 'utf-8' }),
  fs.readFile(path.join(__dirname, './rules.epilog'), { encoding: 'utf-8' })
]).then(([core, rules]) => {
  epilog.definerules(ruleset, epilog.readdata(core));
  epilog.definemorerules(ruleset, epilog.readdata(rules));
});

const testEpilog = (label, data, check) => {
  test(label, t => {
    epilog.definefacts(dataset, epilog.readdata(
      `policy(lfsc)
     policy.startdate(lfsc,2021_01_01)
     policy.enddate(lfsc,2021_12_31)`));

    epilog.definemorefacts(dataset, epilog.readdata(data));

    const result = epilog.compfindp(
      epilog.read(check),
      dataset,
      ruleset);

    assert.ok(result, `failed: ${check}`);
  });
};

testEpilog(
  "Basic hospitalization (covered)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)`,
  `covers(lfsc,hosp)`
);

testEpilog(
  "Hospitalization outside coverage period (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2022_01_01)
hospitalization.enddate(hosp,2022_01_02)`,
  `exclusion(lfsc,hosp,not_in_effect)`
);

testEpilog(
  "Hospitalization outside USA/Canada (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.hospital(hosp,hospital1)
hospital.country(hospital1,germany)`,
  `exclusion(lfsc,hosp,geographic)`
);

testEpilog(
  "Hospitalization proximately for excluded cause (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
type(racing1,racing)
cause(hosp,racing1)`,
  `exclusion(lfsc,hosp,racing)`
);

testEpilog(
  "Hospitalization ultimately for excluded cause (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
cause(hosp,inj)
type(inj,injury)
cause(inj,par)
type(par,parachuting)`,
  `exclusion(lfsc,hosp,parachuting)`
);

testEpilog(
  "Hospitalization for pre-existing condition after 6 months (covered)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2021_08_01)
cause(hosp,preexist1)
type(preexist1,preexist)`,
  `covers(lfsc,hosp)`
);

testEpilog(
  "Hospitalization for pre-existing condition before 6 months (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2021_02_01)
hospitalization.enddate(hosp,2021_02_02)
cause(hosp,preexist1)
type(preexist1,preexist)`,
  `exclusion(lfsc,hosp,preexist)`
);
