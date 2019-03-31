import fromDbSchemaToView from '../../../../src/renderer/generation/psqlFromDbSchemaToView.js';
import schema from './schema.json';
import schemaPsql from './schemaPsql.sql';
import chai from 'chai';

const expect = chai.expect;

describe('psqlFromDbSchemaToView', function() {
  const result = fromDbSchemaToView(schemaPsql);

  it('should return correct result', function() {
     expect(result).to.eql(schema);
  });
});
