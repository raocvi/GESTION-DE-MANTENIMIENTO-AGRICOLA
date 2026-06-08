import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REAL_NAMES = [
  'Juan Carlos Montoya',
  'Andrés Felipe Gómez',
  'Carlos Alberto Rodríguez',
  'Diego Alejandro Martínez',
  'José Luis Herrera',
  'Luis Fernando Castro',
  'Francisco Javier Ospina',
  'Jorge Mario Gutiérrez',
  'Gustavo Adolfo Ortiz',
  'Harold Yesid Valencia',
  'Mauricio de Jesús Cardona',
  'Wilson Alexander Agudelo',
  'Rodrigo Hernán Muñoz',
  'Hernán Darío Jaramillo',
  'Álvaro León Ramírez',
  'Gabriel Jaime Restrepo',
  'William Alberto Ocampo',
  'Nelson Enrique Salazar',
  'Oscar Mario Zapata',
  'Víctor Manuel Piedrahita'
]

async function main() {
  console.log('--- ACTUALIZANDO NOMBRES DE TÉCNICOS ---')
  const techs = await prisma.technician.findMany({
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Encontrados ${techs.length} técnicos en la base de datos.`)

  for (let i = 0; i < techs.length; i++) {
    const tech = techs[i]
    const realName = REAL_NAMES[i % REAL_NAMES.length]
    const internalCode = `TECH-${String(i + 1).padStart(3, '0')}`
    const yearsOfExperience = 3 + (i % 8)

    console.log(`Actualizando Técnico ID ${tech.id}: "${tech.name}" -> "${realName}" (${internalCode})`)

    await prisma.technician.update({
      where: { id: tech.id },
      data: {
        name: realName,
        internalCode: tech.internalCode || internalCode,
        yearsOfExperience: tech.yearsOfExperience || yearsOfExperience
      }
    })

    if (tech.userId) {
      await prisma.user.update({
        where: { id: tech.userId },
        data: { name: realName }
      })
    }
  }

  console.log('✅ Actualización completada con éxito.')
}

main()
  .catch(err => {
    console.error('❌ Error al actualizar:', err)
  })
  .finally(() => prisma.$disconnect())
