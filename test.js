const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  try {
    console.log('Intentando conectar a la base de datos...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'admin',
      password: 'M2randa12',
      database: 'Notificaciones',
    });
    console.log('✅ ¡Conexión exitosa!');

    console.log('\nIntentando consultar la tabla "clientes"...');
    const [rows] = await connection.execute('SELECT * FROM Clientes LIMIT 1;');
    console.log('✅ ¡Consulta a la tabla "clientes" exitosa!');
    console.log('Un registro de ejemplo:', rows);

  } catch (error) {
    console.error('❌ ¡ERROR!', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConexión cerrada.');
    }
  }
}

testConnection();