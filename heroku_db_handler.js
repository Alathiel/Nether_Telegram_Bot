const { Client } = require('pg');

const client = null;
export function setup(){
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	});
	client.connect();
}

export function exec(query){
	client.query(query, (err, res) => {
		if(err){
			console.error(err);
		}
		else{
			console.log('done');
		}
	});
}

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});