//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
const mongoose = require("mongoose");
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../index');
const Monkey = require('../models/Monkey');
const should = chai.should();
chai.use(chaiHttp);


const genData = (type, value, isEnum = false) => {
  if (isEnum) return isEnum[0];
  if (!type) {
    return subDocHelper(value);
  }
  switch (type.toLowerCase()) {
    case 'string':
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    case 'number':
      return Math.floor(Math.random() * 1000);
    case 'object':
      return {
        hi: true, cool: "okay", bean: 123
      };
    case 'boolean':
      return Math.floor(Math.random() * 1000) > 500 ? true : false;
    case 'enum':
    default:

  }
};

const subDocHelper = (obj) => {
  if (!obj) throw new Error('subdocument is undefined');
  let fake = {};
  if (Array.isArray(obj)) {
    fake = [];
    obj.forEach((o) => {
      if (o.type) {
        fake.push(genData(o.type));
      } else {
        Object.keys(o).forEach(key => {
          fake.push({
            [key]: genData(o[key].type)
          });
        });
      }
    });
  } else {
    Object.keys(obj).forEach(key => {
      fake[key] = genData(obj[key].type);
    });
  }
  return fake;
};

const fakeObject = (schema, asString = false) => {
  const fakeObject = {};
  Object.keys(schema).forEach((key) => {
    fakeObject[key] = genData(schema[key].type, schema[key], schema[key].enum);
  });

  if (!asString) return fakeObject;

  // into string
  const str = [];
  Object.keys(fakeObject).forEach(key => {

    const value = schema[key].type === 'String' ? `"${fakeObject[key]}"` : fakeObject[key];
    const isObject = typeof value === 'object';
    let abstractedValue = value;
    if (isObject) {
      if (asString) {
        const _str = [];
        Object.keys(value).forEach(_key => {
          _str.push(`${_key}: ${value[_key]}`);
        });
        abstractedValue = `" ${_str.join(', ')} "`;
      }
    }
    str.push(`${key}: ${abstractedValue}`);
  });
};

describe('REST: Monkey', () => {
  before((done) => {
    Monkey.deleteMany({}, () => {})
    setTimeout(() => {
      [1, 2, 3, 4, 5].forEach(() => {
        const obj = fakeObject({
          "name": {
            "type": "String",
            "default": ""
          },
          "alive": {
            "type": "Boolean",
            "default": false
          },
          "age": {
            "type": "Number",
            "default": false
          }
        });
        Monkey.create(obj)
      });
      done()
    }, 1000)
  });
  /*
   * Test the /GET route
   */
  describe('/GET Monkey', () => {
    it('it should GET all the Monkeys', (done) => {
      chai.request(server)
        .get('/monkeys')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('monkeys');
          res.body.monkeys.docs.should.have.lengthOf(5);
          res.body.monkeys.should.have.property('totalDocs');
          res.body.monkeys.should.have.property('limit');
          res.body.monkeys.should.have.property('offset');
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('/POST Monkey', () => {
    it('it should POST a Monkey', (done) => {
      const _monkey = {
        "name": "5hoxljzgoqcq9syjxxife",
        "alive": false,
        "age": 206
      };
      chai.request(server)
        .post('/monkey')
        .send(_monkey)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('monkey');
          res.body.monkey.should.include.any.keys("name", "alive", "age");
          done();
        });
    });
  });

  /*
   * Test the /GET/:id route
   */
  describe('/GET/:id monkey', () => {
    it('it should GET a monkey by the given id', (done) => {
      let _monkey = new Monkey({
        "name": "2as2vbqx1seii6aaopruz8",
        "alive": false,
        "age": 820
      });
      _monkey.save((err, monkey) => {
        chai.request(server)
          .get('/monkey/' + monkey.id)
          .send(monkey)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.monkey.should.have.include.any.keys("name", "alive", "age");
            res.body.monkey.should.have.property('_id').eql(monkey.id);
            done();
          });
      });

    });
  });

  /*
   * Test the /GET route
   */
  describe('/GET/ monkeys', () => {
    it('it should GET many monkeys', (done) => {
      const _fake5 = new Monkey({
        "name": "8mjklkw0odtawfoz2szt1a",
        "alive": false,
        "age": 533
      });
      _fake5.save((err, inner5) => {
        const _fake6 = new Monkey({
          "name": "zv4vq97jut8fm71lh8ldzm",
          "alive": false,
          "age": 117
        });
        _fake6.save((err, inner6) => {
          chai.request(server)
            .get('/monkeys')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.monkeys.should.have.include.keys("docs", "totalDocs", "limit");
              res.body.monkeys.should.have.property('docs')
              res.body.monkeys.docs.should.be.a('array');
              res.body.monkeys.docs[0].should.have.include.any.keys("name", "alive", "age");
              done();
            });
        });
      });
    });
  });

  /*
   * Test the /PUT/:id route
   */
  describe('/PUT/:id monkey', () => {
    it('it should UPDATE a monkey given the id', (done) => {
      const _monkey = new Monkey({
        "name": "bo1wbuec13glbhb2bkwzd",
        "alive": false,
        "age": 174
      })
      _monkey.save((err, monkey) => {
        chai.request(server)
          .put('/monkey/' + monkey.id)
          .send({
            "name": "bo1wbuec13glbhb2bkwzd",
            "alive": false,
            "age": 174
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('monkey')

            const stringCheck = String(res.body.monkey.age)
            stringCheck.should.equal("174");
            done();
          });
      });
    });
  });

  /*
   * Test the /DELETE/:id route
   */
  describe('/DELETE/:id monkey', () => {
    it('it should DELETE a monkey given the id', (done) => {
      const _monkey = new Monkey({
        "name": "ay24cdfnwnlcs5qvhyo3ne",
        "alive": true,
        "age": 759
      })
      _monkey.save((err, monkey) => {
        chai.request(server)
          .delete('/monkey/' + monkey.id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("monkey");
            res.body.monkey.should.be.a('object');
            res.body.monkey.should.have.property('_id').eql(_monkey.id);
            done();
          });
      });
    });
  });
});