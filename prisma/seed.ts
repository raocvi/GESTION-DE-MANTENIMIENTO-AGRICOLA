/**
 * SEED — AgroMaint Pro
 * Datos iniciales para IMECOL S.A.S. con soporte a Proyectos/Actividades
 * Ejecución: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('\n🌱 Iniciando seed de AgroMaint Pro...\n')

  // 1. Organización
  const org = await db.organization.upsert({
    where: { slug: 'imecol' },
    update: {},
    create: {
      name: 'IMECOL S.A.S.',
      slug: 'imecol',
      email: 'soporte@imecol.com.co',
      phone: '+57 (4) 444-5555',
      address: 'Cra 43A # 1-50, Medellín',
      city: 'Medellín',
      country: 'Colombia',
      currency: 'COP',
      timezone: 'America/Bogota',
      plan: 'enterprise',
    },
  })

  // 2. Roles
  const adminRole = await db.role.upsert({
    where: { name: 'admin' }, update: {},
    create: { name: 'admin', displayName: 'Administrador', description: 'Acceso total', isSystem: true, permissions: '["*"]' },
  })
  const supervisorRole = await db.role.upsert({
    where: { name: 'supervisor' }, update: {},
    create: { name: 'supervisor', displayName: 'Supervisor', description: 'Gestión', isSystem: true, permissions: '["*"]' },
  })
  const techRole = await db.role.upsert({
    where: { name: 'technician' }, update: {},
    create: { name: 'technician', displayName: 'Técnico', description: 'Ejecución', isSystem: true, permissions: '["*"]' },
  })

  // 3. Usuarios y Técnicos
  const passwordHash = await bcrypt.hash('AgroMaint2024!', 12)

  const admin = await db.user.upsert({
    where: { email: 'admin@imecol.com.co' }, update: {},
    create: { organizationId: org.id, email: 'admin@imecol.com.co', password: passwordHash, name: 'Administrador', isActive: true },
  })
  const supervisor = await db.user.upsert({
    where: { email: 'supervisor@imecol.com.co' }, update: {},
    create: { organizationId: org.id, email: 'supervisor@imecol.com.co', password: passwordHash, name: 'Carlos Supervisor', isActive: true },
  })

  const TECH_PROFILES = [
    {
      name: 'Juan Carlos Montoya',
      level: 'specialist',
      position: 'Técnico Especialista en Cosechadoras',
      educationLevel: 'Profesional',
      specialty: ['Cosechadoras de Caña A9900', 'Hidráulica de Alta Presión', 'Diagnóstico Electrónico'],
      courses: ['Curso Avanzado Case IH A9900', 'Sistemas Hidrostáticos y Válvulas', 'Electricidad y CanBus Agrícola'],
      certifications: ['Certificado Expert Case IH', 'Técnico Certificado en Alturas Nivel Avanzado', 'Operación Segura de Autoelevadores'],
      yearsOfExperience: 15
    },
    {
      name: 'Andrés Felipe Gómez',
      level: 'senior',
      position: 'Técnico de Campo Senior',
      educationLevel: 'Tecnólogo',
      specialty: ['Motores Diésel FPT', 'Transmisiones Powershift', 'Sistemas Hidráulicos'],
      courses: ['Diagnóstico de Motores Diésel Tier 3/Tier 4', 'Transmisiones de Tractores John Deere', 'Mantenimiento Preventivo Planificado'],
      certifications: ['Certificación ASE T8 (Motores Diésel)', 'Seguridad Ocupacional en Talleres', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 10
    },
    {
      name: 'Carlos Alberto Rodríguez',
      level: 'mid',
      position: 'Técnico Mecánico de Campo',
      educationLevel: 'Técnico',
      specialty: ['Mecánica Rápida de Tractores', 'Sistemas de Enfriamiento', 'Ajuste de Implementos Agrícolas'],
      courses: ['Fundamentos de Mecánica de Tractores', 'Mantenimiento de Cosechadoras Case IH', 'Lubricación Industrial y Automotriz'],
      certifications: ['Técnico Mecánico por el SENA', 'Trabajo Seguro en Alturas', 'Primeros Auxilios en Campo'],
      yearsOfExperience: 6
    },
    {
      name: 'Diego Alejandro Martínez',
      level: 'junior',
      position: 'Auxiliar de Mantenimiento',
      educationLevel: 'Técnico',
      specialty: ['Mantenimiento Preventivo', 'Cambio de Filtros y Fluidos', 'Alineación básica'],
      courses: ['Inducción a la Maquinaria Agrícola', 'Seguridad y Manejo de Herramientas', 'Básico de Hidráulica'],
      certifications: ['Trabajo en Alturas (Básico)', 'Manejo Seguro de Sustancias Químicas'],
      yearsOfExperience: 2
    },
    {
      name: 'José Luis Herrera',
      level: 'senior',
      position: 'Técnico Eléctrico e Instrumentista',
      educationLevel: 'Tecnólogo',
      specialty: ['Sistemas de Aire Acondicionado', 'Sistemas Eléctricos de Cabina', 'Monitores de Rendimiento y GPS'],
      courses: ['Electricidad del Automóvil Automotriz Avanzada', 'Agricultura de Precisión y GPS John Deere', 'Climatización de Cabinas de Maquinaria'],
      certifications: ['Certificación en Aire Acondicionado Automotriz R134a', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 11
    },
    {
      name: 'Luis Fernando Castro',
      level: 'specialist',
      position: 'Especialista en Agricultura de Precisión',
      educationLevel: 'Profesional',
      specialty: ['Piloto Automático AFS/AMS', 'Telemetría y Conectividad', 'Calibración de Sensores de Rendimiento'],
      courses: ['Sistemas AFS Connect Case IH', 'Configuración de Redes CanBus e ISOBUS', 'Análisis de Datos de Telemetría'],
      certifications: ['Especialista Certificado en Telemetría CASE IH', 'Certificación Trimble en GPS Agrícola'],
      yearsOfExperience: 12
    },
    {
      name: 'Francisco Javier Ospina',
      level: 'mid',
      position: 'Técnico Hidráulico',
      educationLevel: 'Tecnólogo',
      specialty: ['Reparación de Bombas de Pistones', 'Válvulas de Control Hidráulico', 'Diagnóstico de Fugas'],
      courses: ['Circuitos Hidráulicos en Cosechadoras', 'Lectura de Planos Hidráulicos CASE IH', 'Hose & Fittings Parker Training'],
      certifications: ['Certificación Parker en Conexiones y Mangueras', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 5
    },
    {
      name: 'Jorge Mario Gutiérrez',
      level: 'senior',
      position: 'Técnico de Taller Senior',
      educationLevel: 'Técnico',
      specialty: ['Reconstrucción de Motores', 'Soldadura Especializada', 'Ajuste de Tolerancias'],
      courses: ['Overhaul de Motores Cummins y FPT', 'Soldadura SMAW y GMAW Avanzada', 'Metrología de Precisión'],
      certifications: ['Soldador Homologado 3G AWS', 'Certificación en Metrología Mecánica'],
      yearsOfExperience: 14
    },
    {
      name: 'Gustavo Adolfo Ortiz',
      level: 'junior',
      position: 'Auxiliar Técnico',
      educationLevel: 'Técnico',
      specialty: ['Lavado e Inspección Visual', 'Engrase General', 'Logística de Taller'],
      courses: ['Orden y Aseo 5S', 'Introducción a los Sistemas de Tractores', 'Seguridad en el Uso de Elevadores e Hidrolavadoras'],
      certifications: ['Curso Básico de Seguridad Ocupacional', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 3
    },
    {
      name: 'Harold Yesid Valencia',
      level: 'mid',
      position: 'Técnico Mecánico Multifuncional',
      educationLevel: 'Técnico',
      specialty: ['Sistemas de Frenos', 'Mandos Finales y Diferenciales', 'Mecánica Preventiva'],
      courses: ['Transmisiones Mecánicas John Deere', 'Diagnóstico y Ajuste de Mandos Finales', 'Sistemas de Dirección Hidráulica'],
      certifications: ['Trabajo Seguro en Alturas', 'Operador de Montacargas Certificado'],
      yearsOfExperience: 7
    },
    {
      name: 'Mauricio de Jesús Cardona',
      level: 'senior',
      position: 'Técnico Especialista en Cosechadoras',
      educationLevel: 'Tecnólogo',
      specialty: ['Cosechadoras John Deere CH570', 'Extractor y Picador de Cosechadora', 'Sistemas Hidrostáticos'],
      courses: ['Cosechadoras de Caña Serie CH500 John Deere', 'Ajuste y Sincronización del Picador', 'Diagnóstico Electrónico de Cosechadoras'],
      certifications: ['Técnico Master John Deere en Cosechadoras', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 13
    },
    {
      name: 'Wilson Alexander Agudelo',
      level: 'mid',
      position: 'Técnico Electromecánico',
      educationLevel: 'Tecnólogo',
      specialty: ['Sistemas Eléctricos 12V/24V', 'Sensores y Actuadores', 'Diagnóstico de Arranque'],
      courses: ['Inyección Electrónica Diésel Common Rail', 'Uso de Osciloscopio y Multímetro en Maquinaria', 'Básico de CanBus'],
      certifications: ['Técnico Electrónico Automotriz Certificado', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 8
    },
    {
      name: 'Rodrigo Hernán Muñoz',
      level: 'senior',
      position: 'Técnico de Campo Senior',
      educationLevel: 'Técnico',
      specialty: ['Tractores de Alta Potencia', 'Sistemas de Suspensión de Cabina', 'Alineación de Orugas'],
      courses: ['Tractores Case IH Quadtrac y Magnum', 'Sistemas de Tracción en Orugas', 'Ajuste de Válvulas y Calibración del Motor'],
      certifications: ['Técnico Senior Certificado por CNH Industrial', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 12
    },
    {
      name: 'Hernán Darío Jaramillo',
      level: 'mid',
      position: 'Técnico de Motores',
      educationLevel: 'Técnico',
      specialty: ['Sistemas de Inyección de Combustible', 'Turbocompresores', 'Ajuste Culata de Motores'],
      courses: ['Reparación y Diagnóstico de Turbocompresores', 'Mantenimiento de Bombas de Inyección Diésel', 'Diagnóstico de Emisiones Tier 4'],
      certifications: ['Certificación Cummins en Sistemas de Combustible', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 6
    },
    {
      name: 'Álvaro León Ramírez',
      level: 'specialist',
      position: 'Especialista en Diagnóstico y Calibraciones',
      educationLevel: 'Profesional',
      specialty: ['Diagnóstico CanBus Avanzado', 'Calibraciones Electrónicas de Transmisión', 'Análisis de Fallas Complejas'],
      courses: ['Diagnóstico con EST Tool Case IH', 'Calibraciones y Software de Transmisiones Autoshift', 'Análisis de Falla de Componentes Mecánicos'],
      certifications: ['Diagnosticador de Sistemas Master Case IH', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 16
    },
    {
      name: 'Gabriel Jaime Restrepo',
      level: 'mid',
      position: 'Técnico de Mantenimiento Preventivo',
      educationLevel: 'Técnico',
      specialty: ['Análisis de Lubricantes', 'Inspecciones Técnicas Programadas', 'Filtros y Desgastes'],
      courses: ['Muestreo y Análisis de Aceite S.O.S.', 'Planificación del Mantenimiento Preventivo', 'Técnicas de Inspección Visual Avanzada'],
      certifications: ['Analista de Aceites Lubricantes Nivel I', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 5
    },
    {
      name: 'William Alberto Ocampo',
      level: 'senior',
      position: 'Técnico Mecánico Senior',
      educationLevel: 'Tecnólogo',
      specialty: ['Sistemas de Transmisión Hidrostática', 'Mandos Finales de Orugas', 'Cajas de Engranajes'],
      courses: ['Transmisiones Hidrostáticas Eaton & Danfoss', 'Reparación de Cajas de Engranajes Planetarios', 'Diagnóstico de Transmisiones Powershift'],
      certifications: ['Técnico Senior de Transmisiones', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 11
    },
    {
      name: 'Nelson Enrique Salazar',
      level: 'mid',
      position: 'Técnico Soldador / Estructuras',
      educationLevel: 'Técnico',
      specialty: ['Soldadura MIG/TIG y Arco', 'Reparación de Chasis y Tolvas', 'Metalmecánica'],
      courses: ['Soldadura Aplicada a Maquinaria Pesada', 'Ensayos No Destructivos (Líquidos Penetrantes)', 'Corte y Biselado con Oxicorte y Plasma'],
      certifications: ['Inspector de Soldadura Visual', 'Certificación de Soldadura AWS D1.1'],
      yearsOfExperience: 9
    },
    {
      name: 'Oscar Mario Zapata',
      level: 'junior',
      position: 'Técnico Auxiliar de Taller',
      educationLevel: 'Técnico',
      specialty: ['Servicios de Lubricación', 'Mantenimiento de Neumáticos y Llantas', 'Revisión de Niveles'],
      courses: ['Curso de Lubricación e Hidráulica Básica', 'Mantenimiento Preventivo de Tractores', 'Manejo de Residuos Aceitosos y Ambientales'],
      certifications: ['Trabajo Seguro en Alturas (Básico)', 'Brigada de Emergencia y Contra Incendios'],
      yearsOfExperience: 3
    },
    {
      name: 'Víctor Manuel Piedrahita',
      level: 'senior',
      position: 'Técnico Electromecánico Senior',
      educationLevel: 'Tecnólogo',
      specialty: ['Diagnóstico Eléctrico y Electrónico', 'Sistemas de Seguridad de Cabina', 'Sistemas de Suspensión Neumática'],
      courses: ['Sistemas de Control de Cabina Case IH', 'Electricidad Automotriz y Multiplexado', 'Diagnóstico de Sensores de Presión y Temperatura'],
      certifications: ['Técnico Electromecánico Senior por el SENA', 'Trabajo Seguro en Alturas'],
      yearsOfExperience: 10
    }
  ]

  const techUsers = []
  const techs = []
  for (let i = 1; i <= 20; i++) {
    const profile = TECH_PROFILES[i - 1]
    const internalCode = `TECH-${String(i).padStart(3, '0')}`

    const techUser = await db.user.upsert({
      where: { email: `tecnico${i}@imecol.com.co` },
      update: { name: profile.name },
      create: { organizationId: org.id, email: `tecnico${i}@imecol.com.co`, password: passwordHash, name: profile.name, isActive: true },
    })
    techUsers.push(techUser)
    
    // Create or update actual Technician record
    let techRecord = await db.technician.findFirst({ where: { userId: techUser.id } })
    if (!techRecord) {
      techRecord = await db.technician.create({
        data: {
          organizationId: org.id,
          userId: techUser.id,
          name: profile.name,
          internalCode,
          yearsOfExperience: profile.yearsOfExperience,
          level: profile.level,
          position: profile.position,
          educationLevel: profile.educationLevel,
          phone: `+57 300 000 ${i.toString().padStart(4, '0')}`,
          email: `tecnico${i}@imecol.com.co`,
          specialty: JSON.stringify(profile.specialty),
          courses: JSON.stringify(profile.courses),
          certifications: JSON.stringify(profile.certifications),
        }
      })
    } else {
      techRecord = await db.technician.update({
        where: { id: techRecord.id },
        data: {
          name: profile.name,
          internalCode: techRecord.internalCode || internalCode,
          yearsOfExperience: profile.yearsOfExperience,
          level: profile.level,
          position: profile.position,
          educationLevel: profile.educationLevel,
          specialty: JSON.stringify(profile.specialty),
          courses: JSON.stringify(profile.courses),
          certifications: JSON.stringify(profile.certifications)
        }
      })
    }
    techs.push(techRecord)
  }

  // 4. Clientes — Ingenios Azucareros y Palmicultores Reales de Colombia
  const CLIENT_PROFILES = [
    // ── INGENIOS AZUCAREROS ──────────────────────────────────────────
    { name: 'Ingenio Providencia S.A.',         contactName: 'Pedro Isaías Caicedo',    city: 'Palmira',          department: 'Valle del Cauca', phone: '+57 2 275 4000', sector: 'Azucarero' },
    { name: 'Ingenio Manuelita S.A.',           contactName: 'Diego Villegas',          city: 'Palmira',          department: 'Valle del Cauca', phone: '+57 2 272 0100', sector: 'Azucarero' },
    { name: 'Ingenio Risaralda S.A.',           contactName: 'Carlos Arturo Ángel',     city: 'La Virginia',      department: 'Risaralda',       phone: '+57 6 364 7000', sector: 'Azucarero' },
    { name: 'Ingenio La Cabaña S.A.',           contactName: 'Andrés Guzmán',           city: 'Florida',          department: 'Valle del Cauca', phone: '+57 2 232 5000', sector: 'Azucarero' },
    { name: 'Ingenio Pichichi S.A.',            contactName: 'Jorge Molina',            city: 'Guacarí',          department: 'Valle del Cauca', phone: '+57 2 254 0200', sector: 'Azucarero' },
    { name: 'Incauca S.A.',                     contactName: 'Germán Montoya',          city: 'Miranda',          department: 'Cauca',           phone: '+57 2 826 0000', sector: 'Azucarero' },
    { name: 'Ingenio Carmelita S.A.',           contactName: 'Luis Evaristo Potes',     city: 'San Pedro',        department: 'Valle del Cauca', phone: '+57 2 241 4000', sector: 'Azucarero' },
    { name: 'Ingenio Castilla S.A.',            contactName: 'Ricardo Vélez',           city: 'Candelaria',       department: 'Valle del Cauca', phone: '+57 2 269 5000', sector: 'Azucarero' },
    { name: 'Ingenio Mayagüez S.A.',            contactName: 'Rodrigo Lloreda',         city: 'El Cerrito',       department: 'Valle del Cauca', phone: '+57 2 255 6000', sector: 'Azucarero' },
    { name: 'Ingenio San Carlos S.A.',          contactName: 'Héctor Parra',            city: 'Palmira',          department: 'Valle del Cauca', phone: '+57 2 272 4500', sector: 'Azucarero' },
    { name: 'Riopaila Castilla S.A.',           contactName: 'Bernardo Quintero',       city: 'Riofrío',          department: 'Valle del Cauca', phone: '+57 2 239 1000', sector: 'Azucarero' },
    { name: 'Central Tumaco S.A.',              contactName: 'Rafael Guerrero',         city: 'Tumaco',           department: 'Nariño',          phone: '+57 2 722 7000', sector: 'Azucarero' },
    { name: 'Ingenio del Cauca S.A.',           contactName: 'Alejandro Aristizábal',   city: 'Santander de Quilichao', department: 'Cauca',   phone: '+57 2 826 5000', sector: 'Azucarero' },
    // ── PALMICULTORES ────────────────────────────────────────────────
    { name: 'Palmeras de la Costa S.A.',        contactName: 'Jorge Enrique Soto',      city: 'Tierralta',        department: 'Córdoba',         phone: '+57 4 786 1200', sector: 'Palmicultor' },
    { name: 'Palmas del César S.A.',            contactName: 'Álvaro Useche',           city: 'San Alberto',      department: 'César',           phone: '+57 5 570 3100', sector: 'Palmicultor' },
    { name: 'Oleoflores S.A.S.',               contactName: 'Luis Guillermo Vélez',    city: 'San Alberto',      department: 'César',           phone: '+57 5 570 4500', sector: 'Palmicultor' },
    { name: 'Extractora Loma Grande S.A.',      contactName: 'Carlos Sáenz',            city: 'Pivijay',          department: 'Magdalena',       phone: '+57 5 425 0800', sector: 'Palmicultor' },
    { name: 'Palmas Oleaginosas Casanare S.A.', contactName: 'Omar Camargo',            city: 'Aguazul',          department: 'Casanare',        phone: '+57 8 635 7200', sector: 'Palmicultor' },
    { name: 'Ecodiesel Colombia S.A.',          contactName: 'Felipe Arbeláez',         city: 'Puerto Wilches',   department: 'Santander',       phone: '+57 7 615 9000', sector: 'Palmicultor' },
    { name: 'Padelma S.A.',                     contactName: 'Germán Arenas',           city: 'Puerto Wilches',   department: 'Santander',       phone: '+57 7 615 2300', sector: 'Palmicultor' },
    { name: 'Palmeras de Puerto Wilches S.A.',  contactName: 'David Rueda',             city: 'Puerto Wilches',   department: 'Santander',       phone: '+57 7 615 6100', sector: 'Palmicultor' },
    { name: 'Agroince Ltda.',                   contactName: 'Rafael Osorio',           city: 'Montería',         department: 'Córdoba',         phone: '+57 4 782 3400', sector: 'Palmicultor' },
    { name: 'Extractora El Roble S.A.',         contactName: 'Jaime Arrieta',           city: 'María la Baja',    department: 'Bolívar',         phone: '+57 5 288 1200', sector: 'Palmicultor' },
    { name: 'Unipalma de los Llanos S.A.',      contactName: 'Luis Devia',              city: 'Villavicencio',    department: 'Meta',            phone: '+57 8 670 4500', sector: 'Palmicultor' },
    { name: 'Extractora Palmar de Oriente S.A.', contactName: 'Santiago López',         city: 'San Martín',       department: 'Meta',            phone: '+57 8 683 2100', sector: 'Palmicultor' },
    { name: 'Bio D S.A.',                       contactName: 'Augusto Solano',          city: 'Bogotá',           department: 'Cundinamarca',    phone: '+57 1 321 5900', sector: 'Palmicultor' },
    { name: 'Palmas del Magdalena S.A.',        contactName: 'Eduardo García',          city: 'El Retén',         department: 'Magdalena',       phone: '+57 5 438 2700', sector: 'Palmicultor' },
    { name: 'Indupalma Ltda.',                  contactName: 'Roberto Prieto',          city: 'San Alberto',      department: 'César',           phone: '+57 5 570 1800', sector: 'Palmicultor' },
    { name: 'Palmeras del Pacífico S.A.',       contactName: 'Humberto Valverde',       city: 'Tumaco',           department: 'Nariño',          phone: '+57 2 727 4200', sector: 'Palmicultor' },
    { name: 'Coopal Ltda.',                     contactName: 'Fidel Montilla',          city: 'Tumaco',           department: 'Nariño',          phone: '+57 2 727 5600', sector: 'Palmicultor' },
    { name: 'Palmar de Oriente S.A.',           contactName: 'Javier Castaño',          city: 'Puerto López',     department: 'Meta',            phone: '+57 8 636 1400', sector: 'Palmicultor' },
    { name: 'Inversiones La Paz S.A.S.',        contactName: 'Manuel Suárez',           city: 'La Paz',           department: 'César',           phone: '+57 5 579 3300', sector: 'Palmicultor' },
    { name: 'Palmeras La Concepción S.A.S.',    contactName: 'Oswaldo Herazo',          city: 'María la Baja',    department: 'Bolívar',         phone: '+57 5 288 4500', sector: 'Palmicultor' },
    { name: 'C.I. Tequendama S.A.S.',          contactName: 'Pablo Rodríguez',         city: 'Sabana de Torres', department: 'Santander',       phone: '+57 7 654 2100', sector: 'Palmicultor' },
    { name: 'Agropecuaria El Palmar S.A.S.',   contactName: 'Gustavo Pérez',           city: 'Montelíbano',      department: 'Córdoba',         phone: '+57 4 786 8900', sector: 'Palmicultor' },
    { name: 'Palomino Agroindustrial S.A.S.',   contactName: 'Cesar Palomino',          city: 'Mompox',           department: 'Bolívar',         phone: '+57 5 685 3200', sector: 'Palmicultor' },
    { name: 'Agropalmares de Colombia S.A.S.',  contactName: 'Víctor Salcedo',          city: 'Granada',          department: 'Meta',            phone: '+57 8 682 5700', sector: 'Palmicultor' },
    { name: 'Extractora La Gloria S.A.',        contactName: 'Samuel Hernández',        city: 'La Gloria',        department: 'César',           phone: '+57 5 571 0400', sector: 'Palmicultor' },
    { name: 'Agro Aceites La Loma S.A.S.',      contactName: 'Nelson Mendoza',          city: 'El Copey',         department: 'César',           phone: '+57 5 574 6100', sector: 'Palmicultor' },
    { name: 'Palmex Ltda.',                     contactName: 'Norberto Quintero',       city: 'Tibú',             department: 'Norte de Santander', phone: '+57 7 562 3800', sector: 'Palmicultor' },
    { name: 'Extractora Jagua S.A.',            contactName: 'Hernán Díaz',             city: 'Aguachica',        department: 'César',           phone: '+57 5 565 4200', sector: 'Palmicultor' },
    { name: 'Palmeras del Sur S.A.S.',          contactName: 'Eliecer Ruiz',            city: 'Tumaco',           department: 'Nariño',          phone: '+57 2 727 8100', sector: 'Palmicultor' },
    { name: 'Agropecuaria Manantial S.A.S.',    contactName: 'Bernardo Cruz',           city: 'Saravena',         department: 'Arauca',          phone: '+57 7 888 2300', sector: 'Palmicultor' },
    { name: 'Extractora Sicarare S.A.',         contactName: 'Alberto Vargas',          city: 'Valledupar',       department: 'César',           phone: '+57 5 580 4600', sector: 'Palmicultor' },
    { name: 'Palmas Montecarmelo S.A.S.',       contactName: 'Marco Gutiérrez',         city: 'Uchire',           department: 'Meta',            phone: '+57 8 616 3900', sector: 'Palmicultor' },
    { name: 'Palmicultura La Floresta S.A.S.',  contactName: 'Jaime Torres',            city: 'Mapiripán',        department: 'Meta',            phone: '+57 8 622 1500', sector: 'Palmicultor' },
    { name: 'Agroindustrias del Meta S.A.',     contactName: 'Diego Forero',            city: 'Villavicencio',    department: 'Meta',            phone: '+57 8 672 8200', sector: 'Palmicultor' },
    { name: 'Oleoducto de Palma S.A.S.',        contactName: 'César Ramírez',           city: 'Barrancabermeja',  department: 'Santander',       phone: '+57 7 620 5300', sector: 'Palmicultor' },
    { name: 'Palmares de Orocué S.A.S.',        contactName: 'Camilo Sandoval',         city: 'Orocué',           department: 'Casanare',        phone: '+57 8 628 7400', sector: 'Palmicultor' },
    { name: 'Inversiones Palmicafé S.A.S.',     contactName: 'Guillermo Niño',          city: 'Puerto Gaitán',    department: 'Meta',            phone: '+57 8 669 2100', sector: 'Palmicultor' },
    { name: 'Biocombustibles Sostenibles S.A.', contactName: 'Fernando Arias',          city: 'Bogotá',           department: 'Cundinamarca',    phone: '+57 1 743 5800', sector: 'Palmicultor' },
  ]

  const clients = []
  for (let i = 0; i < CLIENT_PROFILES.length; i++) {
    const p = CLIENT_PROFILES[i]
    const idx = i + 1
    const client = await db.client.upsert({
      where: { id: `client-${idx.toString().padStart(3, '0')}` },
      update: {
        name: p.name,
        contactName: p.contactName,
        city: p.city,
        department: p.department,
        phone: p.phone,
      },
      create: {
        id: `client-${idx.toString().padStart(3, '0')}`,
        organizationId: org.id,
        code: `CLI-${idx.toString().padStart(3, '0')}`,
        name: p.name,
        contactName: p.contactName,
        city: p.city,
        department: p.department,
        phone: p.phone,
      },
    })
    clients.push(client)
  }

  // 5. Categorías, Marcas, Modelos
  const caseIH = await db.brand.upsert({ where: { name: 'CASE IH' }, update: {}, create: { name: 'CASE IH', code: 'CASEIH' } })
  const johnDeere = await db.brand.upsert({ where: { name: 'JOHN DEERE' }, update: {}, create: { name: 'JOHN DEERE', code: 'JDEERE' } })

  const catCosechadora = await db.assetCategory.upsert({ where: { code: 'COSE' }, update: {}, create: { code: 'COSE', name: 'Cosechadora' } })
  const catTractor = await db.assetCategory.upsert({ where: { code: 'TRAC' }, update: {}, create: { code: 'TRAC', name: 'Tractor' } })

  const modelA9900 = await db.assetModel.upsert({
    where: { id: 'model-a9900' }, update: {},
    create: { id: 'model-a9900', brandId: caseIH.id, categoryId: catCosechadora.id, name: 'A9900', code: 'A9900' }
  })
  const model8R = await db.assetModel.upsert({
    where: { id: 'model-8r' }, update: {},
    create: { id: 'model-8r', brandId: johnDeere.id, categoryId: catTractor.id, name: '8R 370', code: '8R' }
  })
  const modelPuma = await db.assetModel.upsert({
    where: { id: 'model-puma165' }, update: {},
    create: {
      id: 'model-puma165', brandId: caseIH.id, categoryId: catTractor.id,
      name: 'Puma 165', code: 'PUMA165',
      engine: 'FPT Cursor 9 - 165 HP', power: '165 HP',
      transmission: 'Powershift 19x6',
      hydraulics: 'Sistema hidráulico posterior 110 L/min',
    }
  })

  // 6. Activos (100+)
  const assets = []
  for (let i = 1; i <= 100; i++) {
    const isTractor = i % 2 === 0
    const asset = await db.asset.upsert({
      where: { id: `asset-${i.toString().padStart(3, '0')}` },
      update: {},
      create: {
        id: `asset-${i.toString().padStart(3, '0')}`,
        organizationId: org.id,
        clientId: clients[i % 50].id,
        brandId: isTractor ? johnDeere.id : caseIH.id,
        modelId: isTractor ? model8R.id : modelA9900.id,
        categoryId: isTractor ? catTractor.id : catCosechadora.id,
        internalCode: `EQ-${i.toString().padStart(3, '0')}`,
        serialNumber: `SN${i}XYZ`,
        name: `${isTractor ? 'Tractor' : 'Cosechadora'} ${i}`,
        operativeStatus: 'operative',
        currentHours: 500 + i * 10,
      },
    })
    assets.push(asset)
  }

  // 6b. Tractores CASE IH PUMA 165 (10 unidades)
  const pumaModels = ['165', '180', '195', '210']
  const pumaStatuses = ['operative', 'operative', 'operative', 'operative', 'operative', 'operative', 'maintenance', 'operative', 'operative', 'out_of_service']
  for (let i = 1; i <= 10; i++) {
    const modelVariant = pumaModels[(i - 1) % pumaModels.length]
    await db.asset.upsert({
      where: { id: `puma-${i.toString().padStart(3, '0')}` },
      update: {
        name: `Tractor PUMA ${modelVariant}`,
        internalCode: `PUMA-${i.toString().padStart(3, '0')}`,
      },
      create: {
        id: `puma-${i.toString().padStart(3, '0')}`,
        organizationId: org.id,
        clientId: clients[(i * 3) % 50].id,
        brandId: caseIH.id,
        modelId: modelPuma.id,
        categoryId: catTractor.id,
        internalCode: `PUMA-${i.toString().padStart(3, '0')}`,
        serialNumber: `PUMA${i}SN2024`,
        name: `Tractor PUMA ${modelVariant}`,
        year: 2022 + (i % 3),
        operativeStatus: pumaStatuses[i - 1],
        criticality: 'high',
        currentHours: 800 + i * 120,
      },
    })
  }

  // 7. Proyectos (Órdenes Correctivas)
  // Generaremos 10 Proyectos Grandes con múltiples tareas para el Gantt
  for (let i = 1; i <= 10; i++) {
    const prjNumber = `PRJ-CORR-${i.toString().padStart(3, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: prjNumber } })
    if (existing) continue;

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (Math.random() * 20))
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + 30)

    const workOrder = await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: prjNumber,
        title: `Reparación Mayor de Motor y Transmisión - Proyecto ${i}`,
        type: 'corrective',
        status: i % 2 === 0 ? 'in_progress' : 'assigned',
        priority: 'high',
        assetId: assets[i].id,
        clientId: clients[i].id,
        createdById: admin.id,
        scheduledDate: startDate,
        dueDate: dueDate,
      }
    })

    // Crear 5 a 8 actividades por proyecto
    const totalTasks = 5 + Math.floor(Math.random() * 3)
    let currentTaskStart = new Date(startDate)

    for (let j = 1; j <= totalTasks; j++) {
      const taskEnd = new Date(currentTaskStart)
      taskEnd.setDate(taskEnd.getDate() + (1 + Math.floor(Math.random() * 4)))
      
      const techAssigned = techs[Math.floor(Math.random() * techs.length)]
      
      const progress = i % 2 === 0 ? (j < totalTasks / 2 ? 100 : (j === Math.floor(totalTasks / 2) ? 50 : 0)) : 0
      const status = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'pending')

      const task = await db.workOrderTask.create({
        data: {
          workOrderId: workOrder.id,
          name: `Fase ${j}: ${['Desarme', 'Inspección', 'Rectificación', 'Armado', 'Pruebas', 'Pintura', 'Entrega'][j-1] || 'Actividad general'}`,
          status,
          order: j,
          technicianId: techAssigned.id,
          startDate: currentTaskStart,
          endDate: taskEnd,
          estimatedHours: 16 + Math.random() * 24,
          actualHours: progress > 0 ? 8 + Math.random() * 16 : 0,
          progress,
        }
      })

      // Agregar repuestos a algunas tareas
      if (j % 2 === 0) {
        await db.workOrderPart.create({
          data: {
            workOrderId: workOrder.id,
            taskId: task.id,
            partName: `Repuesto para Fase ${j}`,
            quantity: 2,
            unitCost: 150000,
            totalCost: 300000,
          }
        })
      }

      currentTaskStart = new Date(taskEnd)
    }
  }

  // 8. Órdenes Preventivas normales (30+)
  for (let i = 1; i <= 30; i++) {
    const otNumber = `OT-PREV-${i.toString().padStart(3, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: otNumber } })
    if (existing) continue;

    await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: otNumber,
        title: `Mantenimiento Preventivo 1000H - ${i}`,
        type: 'preventive',
        status: 'pending',
        priority: 'medium',
        assetId: assets[30 + i].id,
        clientId: clients[20 + (i % 20)].id,
        createdById: supervisor.id,
        assignedToId: techUsers[i % 20].id,
      }
    })
  }

  // 9. Órdenes Históricas Cerradas (Para Dashboard MTBF, MTTR, Costos)
  for (let i = 1; i <= 150; i++) {
    const otNumber = `OT-HIST-${i.toString().padStart(4, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: otNumber } })
    if (existing) continue;

    // Generar fechas en el pasado (últimos 6 meses)
    const closedDate = new Date()
    closedDate.setDate(closedDate.getDate() - Math.floor(Math.random() * 180))
    const startDate = new Date(closedDate)
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 5) - 1) // 1 a 5 días de duración
    const scheduledDate = new Date(startDate)
    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 3))

    const isCorrective = Math.random() > 0.5
    const actualHours = Math.floor(Math.random() * 20) + 2
    const laborCost = actualHours * 50000
    const partsCost = isCorrective ? Math.floor(Math.random() * 2000000) : Math.floor(Math.random() * 500000)

    await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: otNumber,
        title: `${isCorrective ? 'Reparación de Falla' : 'Mantenimiento Programado'} - Histórico ${i}`,
        type: isCorrective ? 'corrective' : 'preventive',
        status: 'closed',
        priority: isCorrective ? 'high' : 'medium',
        assetId: assets[i % 100].id,
        clientId: clients[i % 50].id,
        createdById: admin.id,
        assignedToId: techUsers[i % 20].id,
        scheduledDate: scheduledDate,
        startedAt: startDate,
        closedAt: closedDate,
        actualHours,
        laborCost,
        partsCost,
        totalCost: laborCost + partsCost,
      }
    })
  }

  // ─── Catálogo de servicios ────────────────────────────────────────────────
  console.log('🔧 Seeding service catalog...')
  const CATALOG = [
    { value: 'motor', label: 'Motor', services: [
      { value: 'oil_filter', label: 'Cambio de aceite y filtro de aceite', estimatedHours: 2, type: 'preventive' },
      { value: 'fuel_filters', label: 'Cambio de filtros de combustible (primario/secundario)', estimatedHours: 1.5, type: 'preventive' },
      { value: 'air_filter', label: 'Cambio de filtro de aire (primario y secundario)', estimatedHours: 1, type: 'preventive' },
      { value: 'coolant_flush', label: 'Cambio de refrigerante y purga del sistema', estimatedHours: 3, type: 'preventive' },
      { value: 'radiator_clean', label: 'Limpieza de radiador, intercooler y rejillas', estimatedHours: 2, type: 'preventive' },
      { value: 'belt_tensioner', label: 'Cambio de correas y tensores accesorios', estimatedHours: 2, type: 'preventive' },
      { value: 'timing_chain', label: 'Cambio de cadena de distribución y guías', estimatedHours: 8, type: 'preventive' },
      { value: 'valve_adjustment', label: 'Ajuste y calibración de válvulas', estimatedHours: 5, type: 'preventive' },
      { value: 'glow_plugs', label: 'Cambio de bujías de precalentamiento', estimatedHours: 2, type: 'preventive' },
      { value: 'crankshaft_damper', label: 'Cambio de amortiguador de vibración (damper)', estimatedHours: 3, type: 'preventive' },
      { value: 'water_pump', label: 'Cambio de bomba de agua', estimatedHours: 4, type: 'corrective' },
      { value: 'oil_pump', label: 'Cambio de bomba de aceite', estimatedHours: 5, type: 'corrective' },
      { value: 'turbo_inspection', label: 'Inspección y limpieza de turbocompresor', estimatedHours: 2, type: 'inspection' },
      { value: 'turbo_replace', label: 'Cambio de turbocompresor', estimatedHours: 6, type: 'corrective' },
      { value: 'injector_service', label: 'Desmontaje, prueba y calibración de inyectores', estimatedHours: 5, type: 'predictive' },
      { value: 'injector_replace', label: 'Cambio de inyectores', estimatedHours: 4, type: 'corrective' },
      { value: 'fuel_bleed', label: 'Purgado del sistema de combustible', estimatedHours: 1, type: 'corrective' },
      { value: 'gasket_kit', label: 'Cambio de kit de empaquetaduras (culata)', estimatedHours: 12, type: 'corrective' },
      { value: 'compression_test', label: 'Prueba de compresión de cilindros', estimatedHours: 2, type: 'inspection' },
      { value: 'ecu_diagnostic', label: 'Diagnóstico electrónico / escáner ECU Motor', estimatedHours: 2, type: 'predictive' },
      { value: 'engine_overhaul', label: 'Reparación mayor (Overhaul completo) de motor', estimatedHours: 48, type: 'corrective' },
    ]},
    { value: 'transmission', label: 'Transmisión', services: [
      { value: 'trans_oil', label: 'Cambio de aceite de transmisión', estimatedHours: 2, type: 'preventive' },
      { value: 'trans_filter', label: 'Cambio de filtro interno de transmisión', estimatedHours: 3, type: 'preventive' },
      { value: 'trans_calibration', label: 'Calibración electrónica Powershift / CVT', estimatedHours: 2, type: 'predictive' },
      { value: 'trans_diagnostic', label: 'Diagnóstico de fallas electrónicas de transmisión', estimatedHours: 2, type: 'predictive' },
      { value: 'trans_clutch', label: 'Inspección y ajuste de embrague', estimatedHours: 6, type: 'inspection' },
      { value: 'trans_clutch_replace', label: 'Cambio de disco y plato de embrague', estimatedHours: 8, type: 'corrective' },
      { value: 'trans_brake_discs', label: 'Inspección de frenos de discos húmedos', estimatedHours: 4, type: 'inspection' },
      { value: 'torque_converter', label: 'Inspección y limpieza de convertidor de torque', estimatedHours: 6, type: 'inspection' },
      { value: 'torque_replace', label: 'Cambio de convertidor de torque', estimatedHours: 8, type: 'corrective' },
      { value: 'trans_seals', label: 'Cambio de sellos y retenes de transmisión', estimatedHours: 5, type: 'corrective' },
      { value: 'pto_oil', label: 'Cambio de aceite de toma de fuerza (PTO)', estimatedHours: 1, type: 'preventive' },
      { value: 'pto_inspection', label: 'Inspección y ajuste del sistema PTO', estimatedHours: 3, type: 'inspection' },
      { value: 'trans_overhaul', label: 'Reparación mayor (Overhaul) de transmisión', estimatedHours: 36, type: 'corrective' },
    ]},
    { value: 'hydraulic', label: 'Sistema Hidráulico', services: [
      { value: 'hyd_oil', label: 'Cambio de aceite hidráulico', estimatedHours: 2, type: 'preventive' },
      { value: 'hyd_filters', label: 'Cambio de filtros hidráulicos (retorno, presión, carga)', estimatedHours: 2, type: 'preventive' },
      { value: 'hyd_tank_clean', label: 'Limpieza de tanque hidráulico y coladores', estimatedHours: 3, type: 'preventive' },
      { value: 'hyd_pump_inspect', label: 'Prueba y diagnóstico de bomba hidráulica', estimatedHours: 2, type: 'inspection' },
      { value: 'hyd_pump_replace', label: 'Cambio de bomba hidráulica', estimatedHours: 6, type: 'corrective' },
      { value: 'hyd_hoses', label: 'Cambio de mangueras y conexiones hidráulicas', estimatedHours: 3, type: 'corrective' },
      { value: 'hyd_valves', label: 'Revisión, ajuste y calibración de válvulas de control', estimatedHours: 3, type: 'inspection' },
      { value: 'hyd_cylinder', label: 'Reparación de cilindros hidráulicos', estimatedHours: 6, type: 'corrective' },
      { value: 'hyd_steering', label: 'Revisión sistema de dirección hidrostática', estimatedHours: 3, type: 'inspection' },
      { value: 'hyd_sensors', label: 'Calibración de sensores de presión hidráulica', estimatedHours: 2, type: 'predictive' },
      { value: 'hyd_lift', label: 'Calibración sistema de elevación hidráulico', estimatedHours: 2, type: 'preventive' },
    ]},
    { value: 'final_drive', label: 'Mandos Finales', services: [
      { value: 'fd_oil', label: 'Cambio de aceite de mandos finales', estimatedHours: 1.5, type: 'preventive' },
      { value: 'fd_inspection', label: 'Inspección de engranajes planetarios y rueda motriz', estimatedHours: 3, type: 'inspection' },
      { value: 'fd_seals', label: 'Cambio de retenes y sellos de mandos finales', estimatedHours: 4, type: 'corrective' },
      { value: 'fd_brake_discs', label: 'Inspección y cambio de frenos de disco (mando final)', estimatedHours: 5, type: 'corrective' },
      { value: 'fd_bearing', label: 'Cambio de rodamientos de mando final', estimatedHours: 6, type: 'corrective' },
      { value: 'fd_overhaul', label: 'Reparación mayor de mandos finales', estimatedHours: 16, type: 'corrective' },
    ]},
    { value: 'differential', label: 'Diferencial / Ejes', services: [
      { value: 'diff_oil', label: 'Cambio de aceite de diferencial', estimatedHours: 1.5, type: 'preventive' },
      { value: 'diff_inspection', label: 'Inspección de engranajes y corona del diferencial', estimatedHours: 4, type: 'inspection' },
      { value: 'diff_seals', label: 'Cambio de retenes de diferencial y semiejes', estimatedHours: 4, type: 'corrective' },
      { value: 'diff_lock', label: 'Revisión y ajuste del bloqueo diferencial', estimatedHours: 2, type: 'corrective' },
      { value: 'diff_overhaul', label: 'Reparación mayor del diferencial', estimatedHours: 14, type: 'corrective' },
      { value: 'axle_replace', label: 'Cambio de semieje o eje completo', estimatedHours: 6, type: 'corrective' },
    ]},
    { value: 'electrical', label: 'Sistema Eléctrico / Electrónico', services: [
      { value: 'elec_diagnostic', label: 'Diagnóstico electrónico general (AFS/ISOBUS)', estimatedHours: 2, type: 'predictive' },
      { value: 'battery', label: 'Revisión y/o cambio de batería', estimatedHours: 1, type: 'corrective' },
      { value: 'alternator', label: 'Revisión, prueba y/o cambio de alternador', estimatedHours: 3, type: 'corrective' },
      { value: 'starter_motor', label: 'Revisión y/o cambio de motor de arranque', estimatedHours: 3, type: 'corrective' },
      { value: 'wiring_repair', label: 'Reparación de arnés eléctrico y conectores', estimatedHours: 4, type: 'corrective' },
      { value: 'sensor_calibration', label: 'Calibración y reemplazo de sensores y actuadores', estimatedHours: 3, type: 'predictive' },
      { value: 'ecu_update', label: 'Actualización de software ECU / AFS Pro 700', estimatedHours: 2, type: 'preventive' },
      { value: 'lighting', label: 'Revisión y reparación del sistema de iluminación', estimatedHours: 2, type: 'corrective' },
      { value: 'fuse_relay', label: 'Revisión y cambio de fusibles y relés', estimatedHours: 1, type: 'corrective' },
      { value: 'screen_cabin', label: 'Reparación de pantalla y comandos de cabina', estimatedHours: 2, type: 'corrective' },
    ]},
    { value: 'cutting_system', label: 'Sistema de Corte / Cabezal', services: [
      { value: 'blade_sharpen', label: 'Afilado de cuchillas de corte', estimatedHours: 4, type: 'preventive' },
      { value: 'blade_replace', label: 'Cambio de cuchillas de corte', estimatedHours: 3, type: 'corrective' },
      { value: 'header_adjust', label: 'Ajuste de holguras y calibración de cabezal', estimatedHours: 3, type: 'preventive' },
      { value: 'chain_tension', label: 'Lubricación y tensado de cadenas de corte', estimatedHours: 2, type: 'preventive' },
      { value: 'feed_rolls', label: 'Inspección y cambio de rodillos alimentadores', estimatedHours: 5, type: 'corrective' },
      { value: 'header_seals', label: 'Cambio de desgastes (wear plates) de plataforma', estimatedHours: 4, type: 'corrective' },
      { value: 'header_gearbox_oil', label: 'Cambio de aceite de caja del cabezal', estimatedHours: 1, type: 'preventive' },
    ]},
    { value: 'threshing_system', label: 'Sistema de Trilla (Rotor / Cóncavos)', services: [
      { value: 'rotor_inspect', label: 'Inspección del rotor axial y barras de trilla', estimatedHours: 3, type: 'inspection' },
      { value: 'concave_adjust', label: 'Ajuste y calibración de cóncavos', estimatedHours: 2, type: 'preventive' },
      { value: 'concave_replace', label: 'Cambio de cóncavos', estimatedHours: 6, type: 'corrective' },
      { value: 'rotor_bars', label: 'Cambio de barras y dientes del rotor', estimatedHours: 8, type: 'corrective' },
      { value: 'cleaning_sieves', label: 'Limpieza, inspección y ajuste de zarandas', estimatedHours: 3, type: 'preventive' },
      { value: 'fan_adjust', label: 'Ajuste y calibración del ventilador de limpieza', estimatedHours: 2, type: 'preventive' },
    ]},
    { value: 'track_system', label: 'Sistema de Rodado (Orugas)', services: [
      { value: 'track_tension', label: 'Ajuste de tensión de cadena de rodado', estimatedHours: 2, type: 'preventive' },
      { value: 'track_lubrication', label: 'Lubricación del sistema de rodado y tensores', estimatedHours: 1, type: 'preventive' },
      { value: 'track_replace', label: 'Cambio de cadena de rodado (un lado)', estimatedHours: 8, type: 'corrective' },
      { value: 'track_both', label: 'Cambio de cadenas de rodado (ambos lados)', estimatedHours: 14, type: 'corrective' },
      { value: 'idler_wheel', label: 'Cambio de rueda guía (idler)', estimatedHours: 4, type: 'corrective' },
      { value: 'roller_replace', label: 'Cambio de rodillos de apoyo (por unidad)', estimatedHours: 2, type: 'corrective' },
    ]},
    { value: 'tires', label: 'Neumáticos / Ruedas', services: [
      { value: 'tire_pressure', label: 'Revisión y ajuste de presión de neumáticos', estimatedHours: 0.5, type: 'preventive' },
      { value: 'tire_rotation', label: 'Rotación de neumáticos', estimatedHours: 2, type: 'preventive' },
      { value: 'tire_replace_one', label: 'Cambio de un neumático', estimatedHours: 2, type: 'corrective' },
      { value: 'tire_replace_all', label: 'Cambio de juego completo de neumáticos', estimatedHours: 6, type: 'corrective' },
      { value: 'wheel_alignment', label: 'Alineación y convergencia de eje delantero', estimatedHours: 2, type: 'preventive' },
      { value: 'ballast', label: 'Ajuste de lastres (agua o ballast sólido)', estimatedHours: 2, type: 'preventive' },
    ]},
    { value: 'air_conditioning', label: 'Aire Acondicionado / Cabina', services: [
      { value: 'ac_filters', label: 'Cambio de filtros de cabina (recirculación + presurización)', estimatedHours: 1, type: 'preventive' },
      { value: 'ac_recharge', label: 'Recarga de gas refrigerante R134a', estimatedHours: 2, type: 'corrective' },
      { value: 'ac_compressor', label: 'Revisión y/o cambio de compresor A/C', estimatedHours: 4, type: 'corrective' },
      { value: 'ac_condenser', label: 'Limpieza y revisión del condensador A/C', estimatedHours: 2, type: 'preventive' },
      { value: 'cabin_seal', label: 'Revisión de presurización y sellos de cabina', estimatedHours: 2, type: 'inspection' },
    ]},
    { value: 'brakes', label: 'Sistema de Frenos', services: [
      { value: 'brake_inspect', label: 'Inspección y medición del sistema de frenos', estimatedHours: 2, type: 'inspection' },
      { value: 'brake_adjust', label: 'Ajuste y nivelación de frenos', estimatedHours: 2, type: 'preventive' },
      { value: 'brake_fluid', label: 'Cambio de fluido de frenos (DOT)', estimatedHours: 1.5, type: 'preventive' },
      { value: 'brake_bleed', label: 'Purga del sistema de frenos', estimatedHours: 1.5, type: 'corrective' },
      { value: 'brake_discs', label: 'Cambio de discos y pastillas de freno', estimatedHours: 5, type: 'corrective' },
      { value: 'park_brake', label: 'Ajuste y reparación del freno de parqueo', estimatedHours: 2, type: 'corrective' },
    ]},
    { value: 'preventive_pm', label: 'Mantenimiento Preventivo General', services: [
      { value: 'pm_250h', label: 'Mantenimiento preventivo 250 horas', estimatedHours: 5, type: 'preventive' },
      { value: 'pm_500h', label: 'Mantenimiento preventivo 500 horas', estimatedHours: 8, type: 'preventive' },
      { value: 'pm_1000h', label: 'Mantenimiento preventivo 1000 horas', estimatedHours: 12, type: 'preventive' },
      { value: 'pm_2000h', label: 'Mantenimiento preventivo 2000 horas (Overhaul)', estimatedHours: 32, type: 'preventive' },
      { value: 'pre_season', label: 'Revisión y alistamiento pre-cosecha / pre-temporada', estimatedHours: 10, type: 'preventive' },
      { value: 'post_season', label: 'Revisión post-cosecha / almacenamiento', estimatedHours: 8, type: 'preventive' },
      { value: 'warranty_service', label: 'Servicio bajo garantía CASE IH', estimatedHours: 4, type: 'preventive' },
      { value: 'recall_campaign', label: 'Campaña de fábrica (Recall / TSB)', estimatedHours: 3, type: 'preventive' },
      { value: 'predelivery', label: 'Inspección pre-entrega (PDI)', estimatedHours: 6, type: 'inspection' },
    ]},
    { value: 'structural', label: 'Estructura / Chasis', services: [
      { value: 'visual_inspect', label: 'Inspección visual estructural', estimatedHours: 2, type: 'inspection' },
      { value: 'welding_repair', label: 'Reparación y soldadura de estructura', estimatedHours: 6, type: 'corrective' },
      { value: 'anticorrosion', label: 'Tratamiento anticorrosivo y pintura', estimatedHours: 4, type: 'preventive' },
      { value: 'hardware', label: 'Apriete y cambio de pernos (torque)', estimatedHours: 2, type: 'preventive' },
    ]},
    { value: 'otros', label: 'Otros / No clasificado', services: [
      { value: 'other_general', label: 'Servicio general no clasificado', estimatedHours: 2, type: 'corrective' },
      { value: 'other_inspection', label: 'Inspección especial por solicitud', estimatedHours: 2, type: 'inspection' },
      { value: 'other_adjustment', label: 'Ajuste y regulación general', estimatedHours: 2, type: 'preventive' },
      { value: 'other_cleaning', label: 'Limpieza general del equipo', estimatedHours: 3, type: 'preventive' },
      { value: 'other_diagnosis', label: 'Diagnóstico de falla no identificada', estimatedHours: 3, type: 'inspection' },
    ]},
  ]

  for (let ci = 0; ci < CATALOG.length; ci++) {
    const comp = CATALOG[ci]
    const component = await db.serviceComponent.upsert({
      where: { value: comp.value },
      update: { label: comp.label, order: ci },
      create: { value: comp.value, label: comp.label, order: ci },
    })
    for (let si = 0; si < comp.services.length; si++) {
      const svc = comp.services[si]
      await db.serviceType.upsert({
        where: { componentId_value: { componentId: component.id, value: svc.value } },
        update: { label: svc.label, estimatedHours: svc.estimatedHours, type: svc.type, order: si },
        create: { componentId: component.id, value: svc.value, label: svc.label, estimatedHours: svc.estimatedHours, type: svc.type, order: si },
      })
    }
  }
  const svcsTotal = CATALOG.reduce((s, c) => s + c.services.length, 0)
  console.log(`✅ Catálogo: ${CATALOG.length} componentes, ${svcsTotal} tipos de servicio`)

  console.log('✅ Seed completado con éxito (50 Clientes, 100 Activos, 20 Técnicos, 10 Proyectos con Gantt, 30 Preventivas).')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
