const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const TECH_PROFILES = [
  {
    level: 'specialist',
    position: 'Técnico Especialista en Cosechadoras',
    educationLevel: 'Profesional',
    specialty: ['Cosechadoras de Caña A9900', 'Hidráulica de Alta Presión', 'Diagnóstico Electrónico'],
    courses: ['Curso Avanzado Case IH A9900', 'Sistemas Hidrostáticos y Válvulas', 'Electricidad y CanBus Agrícola'],
    certifications: ['Certificado Expert Case IH', 'Técnico Certificado en Alturas Nivel Avanzado', 'Operación Segura de Autoelevadores'],
    yearsOfExperience: 15
  },
  {
    level: 'senior',
    position: 'Técnico de Campo Senior',
    educationLevel: 'Tecnólogo',
    specialty: ['Motores Diésel FPT', 'Transmisiones Powershift', 'Sistemas Hidráulicos'],
    courses: ['Diagnóstico de Motores Diésel Tier 3/Tier 4', 'Transmisiones de Tractores John Deere', 'Mantenimiento Preventivo Planificado'],
    certifications: ['Certificación ASE T8 (Motores Diésel)', 'Seguridad Ocupacional en Talleres', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 10
  },
  {
    level: 'mid',
    position: 'Técnico Mecánico de Campo',
    educationLevel: 'Técnico',
    specialty: ['Mecánica Rápida de Tractores', 'Sistemas de Enfriamiento', 'Ajuste de Implementos Agrícolas'],
    courses: ['Fundamentos de Mecánica de Tractores', 'Mantenimiento de Cosechadoras Case IH', 'Lubricación Industrial y Automotriz'],
    certifications: ['Técnico Mecánico por el SENA', 'Trabajo Seguro en Alturas', 'Primeros Auxilios en Campo'],
    yearsOfExperience: 6
  },
  {
    level: 'junior',
    position: 'Auxiliar de Mantenimiento',
    educationLevel: 'Técnico',
    specialty: ['Mantenimiento Preventivo', 'Cambio de Filtros y Fluidos', 'Alineación básica'],
    courses: ['Inducción a la Maquinaria Agrícola', 'Seguridad y Manejo de Herramientas', 'Básico de Hidráulica'],
    certifications: ['Trabajo en Alturas (Básico)', 'Manejo Seguro de Sustancias Químicas'],
    yearsOfExperience: 2
  },
  {
    level: 'senior',
    position: 'Técnico Eléctrico e Instrumentista',
    educationLevel: 'Tecnólogo',
    specialty: ['Sistemas de Aire Acondicionado', 'Sistemas Eléctricos de Cabina', 'Monitores de Rendimiento y GPS'],
    courses: ['Electricidad del Automóvil Automotriz Avanzada', 'Agricultura de Precisión y GPS John Deere', 'Climatización de Cabinas de Maquinaria'],
    certifications: ['Certificación en Aire Acondicionado Automotriz R134a', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 11
  },
  {
    level: 'specialist',
    position: 'Especialista en Agricultura de Precisión',
    educationLevel: 'Profesional',
    specialty: ['Piloto Automático AFS/AMS', 'Telemetría y Conectividad', 'Calibración de Sensores de Rendimiento'],
    courses: ['Sistemas AFS Connect Case IH', 'Configuración de Redes CanBus e ISOBUS', 'Análisis de Datos de Telemetría'],
    certifications: ['Especialista Certificado en Telemetría CASE IH', 'Certificación Trimble en GPS Agrícola'],
    yearsOfExperience: 12
  },
  {
    level: 'mid',
    position: 'Técnico Hidráulico',
    educationLevel: 'Tecnólogo',
    specialty: ['Reparación de Bombas de Pistones', 'Válvulas de Control Hidráulico', 'Diagnóstico de Fugas'],
    courses: ['Circuitos Hidráulicos en Cosechadoras', 'Lectura de Planos Hidráulicos CASE IH', 'Hose & Fittings Parker Training'],
    certifications: ['Certificación Parker en Conexiones y Mangueras', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 5
  },
  {
    level: 'senior',
    position: 'Técnico de Taller Senior',
    educationLevel: 'Técnico',
    specialty: ['Reconstrucción de Motores', 'Soldadura Especializada', 'Ajuste de Tolerancias'],
    courses: ['Overhaul de Motores Cummins y FPT', 'Soldadura SMAW y GMAW Avanzada', 'Metrología de Precisión'],
    certifications: ['Soldador Homologado 3G AWS', 'Certificación en Metrología Mecánica'],
    yearsOfExperience: 14
  },
  {
    level: 'junior',
    position: 'Auxiliar Técnico',
    educationLevel: 'Técnico',
    specialty: ['Lavado e Inspección Visual', 'Engrase General', 'Logística de Taller'],
    courses: ['Orden y Aseo 5S', 'Introducción a los Sistemas de Tractores', 'Seguridad en el Uso de Elevadores e Hidrolavadoras'],
    certifications: ['Curso Básico de Seguridad Ocupacional', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 3
  },
  {
    level: 'mid',
    position: 'Técnico Mecánico Multifuncional',
    educationLevel: 'Técnico',
    specialty: ['Sistemas de Frenos', 'Mandos Finales y Diferenciales', 'Mecánica Preventiva'],
    courses: ['Transmisiones Mecánicas John Deere', 'Diagnóstico y Ajuste de Mandos Finales', 'Sistemas de Dirección Hidráulica'],
    certifications: ['Trabajo Seguro en Alturas', 'Operador de Montacargas Certificado'],
    yearsOfExperience: 7
  },
  {
    level: 'senior',
    position: 'Técnico Especialista en Cosechadoras',
    educationLevel: 'Tecnólogo',
    specialty: ['Cosechadoras John Deere CH570', 'Extractor y Picador de Cosechadora', 'Sistemas Hidrostáticos'],
    courses: ['Cosechadoras de Caña Serie CH500 John Deere', 'Ajuste y Sincronización del Picador', 'Diagnóstico Electrónico de Cosechadoras'],
    certifications: ['Técnico Master John Deere en Cosechadoras', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 13
  },
  {
    level: 'mid',
    position: 'Técnico Electromecánico',
    educationLevel: 'Tecnólogo',
    specialty: ['Sistemas Eléctricos 12V/24V', 'Sensores y Actuadores', 'Diagnóstico de Arranque'],
    courses: ['Inyección Electrónica Diésel Common Rail', 'Uso de Osciloscopio y Multímetro en Maquinaria', 'Básico de CanBus'],
    certifications: ['Técnico Electrónico Automotriz Certificado', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 8
  },
  {
    level: 'senior',
    position: 'Técnico de Campo Senior',
    educationLevel: 'Técnico',
    specialty: ['Tractores de Alta Potencia', 'Sistemas de Suspensión de Cabina', 'Alineación de Orugas'],
    courses: ['Tractores Case IH Quadtrac y Magnum', 'Sistemas de Tracción en Orugas', 'Ajuste de Válvulas y Calibración del Motor'],
    certifications: ['Técnico Senior Certificado por CNH Industrial', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 12
  },
  {
    level: 'mid',
    position: 'Técnico de Motores',
    educationLevel: 'Técnico',
    specialty: ['Sistemas de Inyección de Combustible', 'Turbocompresores', 'Ajuste Culata de Motores'],
    courses: ['Reparación y Diagnóstico de Turbocompresores', 'Mantenimiento de Bombas de Inyección Diésel', 'Diagnóstico de Emisiones Tier 4'],
    certifications: ['Certificación Cummins en Sistemas de Combustible', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 6
  },
  {
    level: 'specialist',
    position: 'Especialista en Diagnóstico y Calibraciones',
    educationLevel: 'Profesional',
    specialty: ['Diagnóstico CanBus Avanzado', 'Calibraciones Electrónicas de Transmisión', 'Análisis de Fallas Complejas'],
    courses: ['Diagnóstico con EST Tool Case IH', 'Calibraciones y Software de Transmisiones Autoshift', 'Análisis de Falla de Componentes Mecánicos'],
    certifications: ['Diagnosticador de Sistemas Master Case IH', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 16
  },
  {
    level: 'mid',
    position: 'Técnico de Mantenimiento Preventivo',
    educationLevel: 'Técnico',
    specialty: ['Análisis de Lubricantes', 'Inspecciones Técnicas Programadas', 'Filtros y Desgastes'],
    courses: ['Muestreo y Análisis de Aceite S.O.S.', 'Planificación del Mantenimiento Preventivo', 'Técnicas de Inspección Visual Avanzada'],
    certifications: ['Analista de Aceites Lubricantes Nivel I', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 5
  },
  {
    level: 'senior',
    position: 'Técnico Mecánico Senior',
    educationLevel: 'Tecnólogo',
    specialty: ['Sistemas de Transmisión Hidrostática', 'Mandos Finales de Orugas', 'Cajas de Engranajes'],
    courses: ['Transmisiones Hidrostáticas Eaton & Danfoss', 'Reparación de Cajas de Engranajes Planetarios', 'Diagnóstico de Transmisiones Powershift'],
    certifications: ['Técnico Senior de Transmisiones', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 11
  },
  {
    level: 'mid',
    position: 'Técnico Soldador / Estructuras',
    educationLevel: 'Técnico',
    specialty: ['Soldadura MIG/TIG y Arco', 'Reparación de Chasis y Tolvas', 'Metalmecánica'],
    courses: ['Soldadura Aplicada a Maquinaria Pesada', 'Ensayos No Destructivos (Líquidos Penetrantes)', 'Corte y Biselado con Oxicorte y Plasma'],
    certifications: ['Inspector de Soldadura Visual', 'Certificación de Soldadura AWS D1.1'],
    yearsOfExperience: 9
  },
  {
    level: 'junior',
    position: 'Técnico Auxiliar de Taller',
    educationLevel: 'Técnico',
    specialty: ['Servicios de Lubricación', 'Mantenimiento de Neumáticos y Llantas', 'Revisión de Niveles'],
    courses: ['Curso de Lubricación e Hidráulica Básica', 'Mantenimiento Preventivo de Tractores', 'Manejo de Residuos Aceitosos y Ambientales'],
    certifications: ['Trabajo Seguro en Alturas (Básico)', 'Brigada de Emergencia y Contra Incendios'],
    yearsOfExperience: 3
  },
  {
    level: 'senior',
    position: 'Técnico Electromecánico Senior',
    educationLevel: 'Tecnólogo',
    specialty: ['Diagnóstico Eléctrico y Electrónico', 'Sistemas de Seguridad de Cabina', 'Sistemas de Suspensión Neumática'],
    courses: ['Sistemas de Control de Cabina Case IH', 'Electricidad Automotriz y Multiplexado', 'Diagnóstico de Sensores de Presión y Temperatura'],
    certifications: ['Técnico Electromecánico Senior por el SENA', 'Trabajo Seguro en Alturas'],
    yearsOfExperience: 10
  }
]

async function main() {
  console.log('--- ACTUALIZANDO HOJAS DE VIDA (HV) DE TÉCNICOS ---')
  const techs = await prisma.technician.findMany({
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Encontrados ${techs.length} técnicos en la base de datos.`)

  for (let i = 0; i < techs.length; i++) {
    const tech = techs[i]
    const profile = TECH_PROFILES[i % TECH_PROFILES.length]

    console.log(`Actualizando HV de "${tech.name}" -> Nivel: ${profile.level}, Cargo: ${profile.position}`)

    await prisma.technician.update({
      where: { id: tech.id },
      data: {
        level: profile.level,
        position: profile.position,
        educationLevel: profile.educationLevel,
        yearsOfExperience: profile.yearsOfExperience,
        specialty: JSON.stringify(profile.specialty),
        courses: JSON.stringify(profile.courses),
        certifications: JSON.stringify(profile.certifications)
      }
    })
  }

  console.log('✅ Hojas de Vida actualizadas exitosamente.')
}

main()
  .catch(err => {
    console.error('❌ Error al actualizar HV:', err)
  })
  .finally(() => prisma.$disconnect())
