import fromViewToDbSchema from '../../../../src/renderer/generation/psql/fromViewToDbSchema.js';
import schema from './schema.json';
import schemaPsql from './schemaPsql.sql';
import chai from 'chai';

const expect = chai.expect;

describe('fromViewToDbSchema', function() {
  const result = fromViewToDbSchema(schema);
  it('should return correct result', function() {
     expect(result).to.equal(schemaPsql);
  });
});
