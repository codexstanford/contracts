#!/usr/bin/env node

import * as epilog from '@epilog/epilog';
import assert from 'node:assert';
import glob from 'glob';
import fs from 'fs/promises';
import path from 'path';
import test from 'node:test';
import YAML from 'yaml';

const __dirname = new URL('.', import.meta.url).pathname;

let testPaths = [];
glob(__dirname + '**/*.yml', (err, paths) => {
  if (err) {
    console.error(err);
    return;
  }

  paths.forEach(path => {
    Promise.all([
      loadRules(path),
      fs.readFile(path, { encoding: 'utf-8' }).then(parseTests)
    ]).then(([rules, t]) => {
      t.context.rules = rules;
      runTests(t.tests, t.context);
    });
  });
});

function loadRules(testPath) {
  return Promise.all([
    fs.readFile(path.join(testPath, '../../core.epilog'), { encoding: 'utf-8' }),
    fs.readFile(path.join(testPath, '../rules.epilog'), { encoding: 'utf-8' })
  ]).then(([core, rules]) => {
    const ruleset = [];
    epilog.definerules(ruleset, epilog.readdata(core));
    epilog.definemorerules(ruleset, epilog.readdata(rules));
    return ruleset;
  });
}

function parseTests(sourceText) {
  const docs = YAML.parseAllDocuments(sourceText).map(d => { return d.toJS(); });
  const result = { context: {}, tests: [] };

  if (docs[0].commonSetup) {
    result.context.commonSetup = docs[0].commonSetup;
    result.tests = docs.slice(1);
  } else {
    result.tests = docs;
  }

  return result;
}

function runTests(tests, context) {
  tests.forEach(testCase => {
    test(testCase.label, () => {
      const dataset = [];

      if (context.commonSetup) {
        epilog.definefacts(dataset, epilog.readdata(context.commonSetup));
      }

      epilog.definemorefacts(dataset, epilog.readdata(testCase.setup));

      testCase.check.split('\n').filter(Boolean).forEach(check => {
        const result = epilog.compfindp(
          epilog.read(check),
          dataset,
          context.rules);

        assert.ok(result, `failed: ${check}`);
      });
    });
  });
}
