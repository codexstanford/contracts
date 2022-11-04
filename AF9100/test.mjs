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
      `policy(af9100)
     policy.startdate(af9100,2020_01_01)
     policy.enddate(af9100,2021_12_31)`));

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
  `covers(af9100,hosp)`
);

testEpilog(
  "Hospitalization outside coverage period (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2022_01_01)
hospitalization.enddate(hosp,2022_01_02)`,
  `exclusion(af9100,hosp,not_in_effect)`
);

testEpilog(
  "Hospitalization shorter than 23 hours (excluded)",
  `hospitalization(hosp_short)
hospitalization.facility(hosp_short,hospital)
hospitalization.startdate(hosp_short,2021_01_01)
hospitalization.starttime(hosp_short,00_00_00)
hospitalization.enddate(hosp_short,2021_01_01)
hospitalization.endtime(hosp_short,00_01_00)`,
  `exclusion(af9100,hosp_short,short)`
);

testEpilog(
  "Hospitalization proximately for excluded cause (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
type(racing1,felony)
cause(hosp,racing1)`,
  `exclusion(af9100,hosp,2_d_4)`
);

testEpilog(
  "Hospitalization ultimately for excluded cause (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
cause(hosp,inj5)
type(inj5,injury)
cause(inj5,par5)
type(par5,felony)`,
  `exclusion(af9100,hosp,2_d_4)`
);

testEpilog(
  "Hospitalization for pre-existing condition after 12 months (covered)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2021_08_01)
hospitalization.enddate(hosp,2021_08_02)
cause(hosp,preexist6)
type(preexist6,preexist)`,
  `covers(af9100,hosp)`
);

testEpilog(
  "Hospitalization for pre-existing condition before 12 months (excluded)",
  `hospitalization(hosp)
hospitalization.facility(hosp,hospital)
hospitalization.startdate(hosp,2020_02_01)
hospitalization.enddate(hosp,2020_02_02)
cause(hosp,preexist7)
type(preexist7,preexist)`,
  `exclusion(af9100,hosp,2_a_1)`
);

testEpilog(
  "Hospitalization for dental treatment arising from injury (covered)",
  `hospitalization(hosp_dental_injury)
hospitalization.facility(hosp_dental_injury,hospital)
cause(hosp_dental_injury,dental1)
type(dental1,dental_care)
cause(dental1,injury1)
type(injury1,injury)`,
  `covers(af9100,hosp_dental_injury)`
);

testEpilog(
  "Hospitalization for dental treatment not arising from injury (excluded)",
  `hospitalization(hosp_dental)
hospitalization.facility(hosp_dental,hospital)
cause(hosp_dental,dental2)
type(dental2,dental_care)`,
  `exclusion(af9100,hosp_dental,2_d_7)`
);
