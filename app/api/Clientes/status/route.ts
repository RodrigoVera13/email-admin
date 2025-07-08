import { NextResponse } from 'next/server';
import db from '../../../lib/db'; // Asegúrate que la ruta a tu conexión de BD sea correcta

// PATCH /api/Clientes/status
// Actualiza el flag_activo para un único cliente.
export async function PATCH(request: Request) {
  try {
    const { ruc, flag_activo }: { ruc: string; flag_activo: 0 | 1 } = await request.json();

    // Validamos que los datos necesarios estén presentes y sean correctos.
    if (!ruc || (flag_activo !== 0 && flag_activo !== 1)) {
      return NextResponse.json({ message: 'Datos inválidos. Se requiere RUC y un flag_activo (0 o 1).' }, { status: 400 });
    }

    const sql = "UPDATE `Clientes` SET `flag_activo` = ? WHERE `ruc` = ?";
    
    const [result] = await db.query(sql, [flag_activo, ruc]);

    // Verificamos si la actualización afectó alguna fila.
    if ((result as any).affectedRows === 0) {
        // Esto puede pasar si el RUC no existe. Devolvemos un 404.
        return NextResponse.json({ message: `Cliente con RUC ${ruc} no encontrado.` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Estado del cliente actualizado exitosamente.' });

  } catch (error: any) {
    console.error('Error updating client status:', error);
    return NextResponse.json({ message: 'Error al actualizar el estado del cliente', error: error.message }, { status: 500 });
  }
}