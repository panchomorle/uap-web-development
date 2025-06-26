import { database } from './connection';

async function cleanupBoards() {
  try {
    // Verificar tableros con id NULL antes de eliminar
    // const boardsWithNullId = await database.all('SELECT * FROM boards WHERE id IS NULL');
    // console.log('Tableros con id NULL encontrados:', boardsWithNullId);

    // Contar tableros con id NULL
    // const count = await database.get<{tableros_con_id_null: number}>('SELECT COUNT(*) as tableros_con_id_null FROM boards WHERE id IS NULL');
    // console.log('Cantidad de tableros con id NULL:', count?.tableros_con_id_null);

    // Eliminar tableros con id NULL
    // await database.run('DELETE FROM boards WHERE id IS NULL');
    // console.log('Tableros con id NULL eliminados');
    // Eliminar todas las tablas
    await database.run('DROP TABLE IF EXISTS boards');
    await database.run('DROP TABLE IF EXISTS tasks');
    await database.run('DROP TABLE IF EXISTS users');
    console.log('Todas las tablas eliminadas');

  } catch (error) {
    console.error('Error ejecutando cleanup:', error);
  }
}

// Ejecutar y cerrar conexión
cleanupBoards().then(() => {
  database.close();
  console.log('Cleanup completado');
});