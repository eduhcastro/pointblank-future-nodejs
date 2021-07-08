const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'Evo3',
  password: '123456'
})

const Postgres = {

  query: {

  Callback: (query, fields, callback, pg = pool) => {
      pg.connect((err, client, release) => {
          if (err) {
              return callback([{
                  queryError: true
              }])
          }
          client.query(query, fields, (err, result) => {
              release()
              if (err) {
                  return callback([{
                      queryError: true
                  }])
              }
              return callback(result)
          })
      })
  },

  Execute: async (query, fields, pg = pool) => {
    const client = await pg.connect()
    let res
    try {
      await client.query('BEGIN')
      try {
        res = await client.query(query, fields)
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    } finally {
      client.release()
    }
    return res

  }
}
}

module.exports = Postgres
