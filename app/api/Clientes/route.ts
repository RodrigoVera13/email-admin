import { NextResponse } from 'next/server';
import db from '../../lib/db'; // Asegúrate que la ruta sea correcta
import type { CompanyGroup } from '../../types';

// OBTENER (sin cambios)
export async function GET() {
  try {
    const [rows] = await db.query("SELECT `ruc`, `description`, `email`, `flag_activo` FROM `Clientes`");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ message: 'Error al obtener los Clientes', error: error.message }, { status: 500 });
  }
}

// POST ACTUALIZADO PARA MANEJAR EMAILS NULOS
export async function POST(request: Request) {
  const connection = await db.getConnection();
  try {
    // Ahora el payload es un simple array de empresas a activar.
    const companiesToActivate: CompanyGroup[] = await request.json();

    if (!Array.isArray(companiesToActivate) || companiesToActivate.length === 0) {
      return NextResponse.json({ message: 'No se proporcionaron empresas para activar.' }, { status: 400 });
    }
    
    await connection.beginTransaction();

    for (const company of companiesToActivate) {
      const { ruc, nombre, email } = company;
      // El flag_activo siempre será 1 para este endpoint.
      const isActive = 1;

      const sql = `
        INSERT INTO \`Clientes\` (\`id\`, \`description\`, \`ruc\`, \`email\`, \`flag_activo\`)
        VALUES (NULL, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`description\` = VALUES(description),
          \`email\` = VALUES(email),
          \`flag_activo\` = ? 
      `;
      
      await connection.query(sql, [nombre, ruc, email || '', isActive, isActive]);
    }

    await connection.commit();
    return NextResponse.json({ message: `${companiesToActivate.length} clientes activados exitosamente.` });

  } catch (error: any) {
    await connection.rollback();
    console.error('Error activating clients:', error);
    return NextResponse.json({ message: 'Error al activar los Clientes', error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}


// GUARDAR EMAIL (también corregido para consistencia)
export async function PUT(request: Request) {
    try {
        const company: { ruc: string; nombre: string; email: string } = await request.json();

        if (!company || !company.ruc || !company.email) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
        }
        
        const { ruc, nombre, email } = company;
        
        const sql = `
            INSERT INTO \`Clientes\` (\`id\`, \`description\`, \`ruc\`, \`email\`, \`flag_activo\`)
            VALUES (NULL, ?, ?, ?, 0)
            ON DUPLICATE KEY UPDATE
                \`email\` = VALUES(email)
        `;
        
        // El email que llega aquí siempre debería tener un valor por la validación anterior.
        await db.query(sql, [nombre, ruc, email]);
        
        return NextResponse.json({ message: `Email para ${nombre} guardado.` });
    } catch (error: any) {
        console.error('Error saving email:', error);
        return NextResponse.json({ message: 'Error al guardar el email', error: error.message }, { status: 500 });
    }
}