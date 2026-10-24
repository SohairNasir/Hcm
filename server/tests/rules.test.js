import test from 'node:test';import assert from 'node:assert/strict';import {tax,haversine,workDays} from '../src/lib.js';
test('tax slab',()=>{assert.equal(tax(50000),0);assert.equal(tax(100000),2500)});
test('working days skip weekends',()=>assert.equal(workDays('2026-10-19','2026-10-25',{weekend:[0,6]},new Set()),5));
test('holiday is skipped',()=>assert.equal(workDays('2026-10-19','2026-10-23',{weekend:[0,6]},new Set(['2026-10-21'])),4));
test('haversine',()=>{assert.equal(haversine(24.86,67,24.86,67),0);assert.ok(Math.abs(haversine(0,0,0,1)-111195)<200)});
