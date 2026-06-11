/**
 * @file seed-plans.ts
 * @description Carga los planes de mantenimiento REALES extraídos de los
 * manuales oficiales Case IH:
 *  - A9900 / Austoft 9900 (Manual del Operador, Sección 7) — 78 actividades
 *  - Puma 165/180/195/210 (Manual de Empleo y Cuidado 84170978, Sección 4) — 61 actividades
 *
 * También crea: marcas, categorías, modelos de activo, documentos (manuales),
 * repuestos/insumos derivados de los planes y mantenimientos programados
 * (ScheduledMaintenance) para los activos existentes.
 *
 * Idempotente: usa upsert/find por claves naturales. Ejecutar:
 *   npx ts-node --project tsconfig.json prisma/seed-plans.ts
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PlanRow = [
  name: string,
  interval: string,   // '25' | 'PRIMERAS 50 HORAS' | 'CADA 600 HORAS' | 'Operativo' | ...
  system: string,
  fluid: string,      // '' si no aplica
  manualPage: string, // 'Pág. 7-55'
  notes: string,
]

// ─── Plan A9900 / AUSTOFT 9900 (Sección 7 del manual) ────────────────────────

const A9900_TASKS: PlanRow[] = [
  ['Regeneración del sistema SCR (Tier 4b / Stage V)', 'PRIMERAS 20 HORAS', 'Motor – Sistema de escape / SCR', 'AdBlue / DEF / ARLA 32', 'Pág. 7-55', 'Solo Tier 4b y Stage V. Seguir procedimiento completo del manual.'],
  ['Verificar nivel de aceite hidráulico', '25', 'Sistema hidráulico', 'Aceite hidráulico ISO VG 46', 'Pág. 7-55', 'Verificar con motor frío. Corregir fugas antes de rellenar.'],
  ['Verificar nivel de aceite del motor', '25', 'Motor', 'Aceite motor SAE 15W-40 (AKCELA)', 'Pág. 7-59', 'Revisar varilla de nivel. No sobrellenar.'],
  ['Verificar nivel de refrigerante del motor', '25', 'Motor – Sistema de enfriamiento', 'Refrigerante OAT (vida extendida)', 'Pág. 7-61', 'Verificar en depósito de expansión. Solo refrigerante aprobado.'],
  ['Verificar nivel de DEF/AdBlue/ARLA 32', '25', 'Motor – Sistema SCR', 'DEF / AdBlue / ARLA 32', 'Pág. 7-63', 'No mezclar DEF con otros líquidos.'],
  ['Verificar nivel de aceite de la caja de engranajes de la bomba', '25', 'Sistema hidráulico – Caja bomba', 'AKCELA GEAR 135H EP 85W-140', 'Pág. 7-65', 'Verificar mirilla de nivel lateral.'],
  ['Verificar nivel de aceite de transmisiones finales planetarias', '25', 'Transmisión – Transmisiones finales', 'AKCELA NEXPLORE 10W-40', 'Pág. 7-67', 'Verificar ambas transmisiones izquierda y derecha.'],
  ['Inspeccionar paleta del ventilador del extractor', '25', 'Extractor primario', '', 'Pág. 7-68', 'Verificar grietas, deformaciones y tornillos de fijación.'],
  ['Inspeccionar mangueras, tubos y conexiones hidráulicas', '25', 'Sistema hidráulico', '', 'Pág. 7-69', 'Inspección visual de fugas, abrasión y deterioro.'],
  ['Inspeccionar y ajustar cuchillas del cortador de base', '25', 'Cortador de base', '', 'Pág. 7-71', 'Verificar filo, fisuras y tornillos. Sustituir si es necesario.'],
  ['Inspeccionar cuchillas del despuntador', '25', 'Despuntador / Topper', '', 'Pág. 7-76', 'Verificar desgaste. Rotar o sustituir según condición.'],
  ['Inspeccionar paletas laterales', '25', 'Extractor secundario', '', 'Pág. 7-78', 'Verificar desgaste y fijación de pernos.'],
  ['Inspeccionar cuchillas del picador', '25', 'Picador', '', 'Pág. 7-80', 'Verificar afilado, grietas y tornillos. Rotar según desgaste.'],
  ['Inspeccionar protección de goma del parachoques de rodillos flotadores', '25', 'Tren de rodillos (oruga)', '', 'Pág. 7-84', 'Solo AUSTOFT 9900. Verificar desgaste o desprendimiento.'],
  ['Verificar tensión de la cadena del elevador', '25', 'Elevador de caña', '', 'Pág. 7-86', 'Ajustar según especificación. No tensar en exceso.'],
  ['Verificar tensión de la oruga', '25', 'Tren de rodaje – Oruga', 'Grasa de litio NLGI 2', 'Pág. 7-88', 'Solo AUSTOFT 9900. Deflexión B entre 45-65 mm en punto central entre rueda tensora y rodillo guía. Verificar ambas orugas.'],
  ['Drenar/verificar filtro de combustible/separador de agua', '25', 'Motor – Sistema de combustible', 'Combustible diésel', 'Pág. 7-90', 'Drenar agua acumulada. No arrancar con filtro vacío.'],
  ['Lubricación general de la máquina completa', '25', 'General – Puntos de engrase', 'Grasa multipropósito NLGI 2', 'Pág. 7-91', 'Aplicar grasa en todos los nipples según mapa de lubricación.'],
  ['Puntos de lubricación – Modelo AUSTOFT 9900', '25', 'Tren de rodaje – Puntos de engrase', 'Grasa multipropósito NLGI 2', 'Pág. 7-92', 'Solo AUSTOFT 9900. Consultar diagrama del manual.'],
  ['Cambio de aceite – Caja de engranajes de la bomba (primera vez)', 'PRIMERAS 50 HORAS', 'Sistema hidráulico – Caja bomba', 'AKCELA GEAR 135H EP 85W-140 | 7,5 L', 'Pág. 7-97', 'Primera vez. Continuar cada 500 h.'],
  ['Cambio de aceite – Caja de transmisión del cortador de base (primera vez)', 'PRIMERAS 50 HORAS', 'Cortador de base – Caja transmisión', 'AKCELA GEAR 135H EP 85W-140', 'Pág. 7-99', 'Primera vez. Continuar cada 500 h.'],
  ['Cambio de aceite – Caja de engranajes del picador (primera vez)', 'PRIMERAS 50 HORAS', 'Picador – Caja engranajes', 'AKCELA GEAR 135H EP 85W-140 | 7,5 L', 'Pág. 7-101', 'Primera vez. Continuar cada 500 h.'],
  ['Cambio de aceite – Transmisión final planetaria (primera vez)', 'PRIMERAS 50 HORAS', 'Transmisión – Transmisiones finales', 'Tutela Hypoide EP 85W-140 NT', 'Pág. 7-103', 'Primera vez. Tapón de drenaje hacia abajo. Llenar hasta borde del orificio de nivel. Continuar cada 250 h.'],
  ['Sustituir filtros de retorno del aceite hidráulico (primera vez)', 'PRIMERAS 50 HORAS', 'Sistema hidráulico – Filtros', 'Elemento filtrante OEM', 'Pág. 7-104', 'Primera vez. Continuar cada 1.000 h.'],
  ['Sustituir filtro de presión del sistema hidráulico (primera vez)', 'PRIMERAS 50 HORAS', 'Sistema hidráulico – Filtro de presión', 'Elemento filtrante OEM', 'Pág. 7-110', 'Primera vez. Continuar cada 1.000 h.'],
  ['Verificar precarga del eje doble (primera vez)', 'PRIMERAS 50 HORAS', 'Tren de rodaje – Eje doble', 'Grasa Tutela Multi-Purpose GR-9', 'Pág. 7-112', 'Solo AUSTOFT 9900. Par tuerca almenada: 1200 N·m. Continuar cada 750 h.'],
  ['Verificar precarga del cojinete principal del extractor', 'PRIMERAS 50 HORAS', 'Extractor primario – Cojinete', 'Grasa NLGI 2', 'Pág. 7-114', 'Ajustar tensión según procedimiento del manual.'],
  ['Par de apriete de los pernos de las orugas', '50', 'Tren de rodaje – Orugas', '', 'Pág. 7-119', 'Solo AUSTOFT 9900. Verificar con llave de torque.'],
  ['Puntos de engrase – Modelo AUSTOFT 9900', '50', 'Tren de rodaje – Engrase', 'Grasa multipropósito NLGI 2', 'Pág. 7-120', 'Solo AUSTOFT 9900. Diagrama pág. 7-120.'],
  ['Cambio de aceite – Transmisión final planetaria', '250', 'Transmisión – Transmisiones finales', 'Tutela Hypoide EP 85W-140 NT', 'Pág. 7-125', 'Drenar en caliente. Verificar contaminación metálica. Llenar hasta borde del orificio de nivel.'],
  ['Limpiar/sustituir filtro de aire exterior de la cabina', '250', 'Cabina – Climatización', 'Elemento filtrante OEM', 'Pág. 7-126', 'Limpiar con aire comprimido; sustituir si está dañado.'],
  ['Limpiar/sustituir filtro de recirculación del aire de la cabina', '250', 'Cabina – Climatización', 'Elemento filtrante OEM', 'Pág. 7-128', 'Asegurar sellado correcto al reinstalar.'],
  ['Inspeccionar correas del motor', '250', 'Motor – Transmisión de accesorios', '', 'Pág. 7-129', 'Verificar tensión, grietas y desgaste.'],
  ['Verificar extintor de incendios', '250', 'Seguridad', '', 'Pág. 7-130', 'Verificar presión, precinto y fecha de vencimiento.'],
  ['Verificar precarga del embrague del volante motor del picador', '250', 'Picador – Embrague', '', 'Pág. 7-131', 'Detectar holgura forzando volante. Si hay: reapretar tuerca ranurada + ½ vuelta adicional.'],
  ['Lubricación general completa de la máquina', '250', 'General – Lubricación', 'Grasa multipropósito NLGI 2', 'Pág. 7-133', 'Todos los puntos de grasa según diagrama.'],
  ['Limpiar filtro de rejilla del depósito de combustible', '250', 'Sistema de combustible – Depósito', '', 'Pág. 7-134', 'Limpiar malla con disolvente no inflamable.'],
  ['Limpiar tamiz de boca de llenado del depósito DEF/AdBlue', '250', 'Motor – Sistema SCR', 'DEF / AdBlue / ARLA 32', 'Pág. 7-135', 'Solo Tier 3, 4b y Stage V.'],
  ['Verificar/recolocar aletas del elevador en la cadena', '250', 'Elevador de caña', '', 'Pág. 7-137', 'Medir desgaste: (A) 10 eslabones → nominal 508 mm, máx 518.16 mm; (B) diámetro rodillos → nominal 38.1 mm, mín 28.5 mm. Sustituir cadena si excede.'],
  ['Acondicionamiento de la oruga (primera temporada)', 'PRIMERAS 500 HORAS', 'Tren de rodaje – Oruga', '', 'Pág. 7-139', 'Solo AUSTOFT 9900. Procedimiento especial de primera temporada.'],
  ['Inspeccionar rodillo de la cinta transportadora', '500', 'Cinta transportadora / Elevador', '', 'Pág. 7-139', 'Verificar desgaste, alineación y rodamientos.'],
  ['Sustituir filtro de aire de la cabina', '500', 'Cabina – Climatización', 'Elemento filtrante OEM', 'Pág. 7-140', 'Sustituir aunque no parezca sucio.'],
  ['Sustituir filtro de combustible principal', '500', 'Motor – Sistema de combustible', 'Elemento filtrante OEM', 'Pág. 7-142', 'Purgar aire del sistema tras la sustitución.'],
  ['Sustituir filtro de combustible/separador de agua', '500', 'Motor – Sistema de combustible', 'Elemento filtrante OEM', 'Pág. 7-143', 'Drenar agua antes de retirar el cartucho.'],
  ['Sustituir filtro de aspiración del circuito DEF', '500', 'Motor – Sistema SCR', 'Elemento filtrante OEM', 'Pág. 7-144', 'Solo Tier 3, 4b y Stage V. No reutilizar.'],
  ['Sustituir filtro de recirculación de gas del motor (EGR)', '500', 'Motor – EGR', 'Elemento filtrante OEM', 'Pág. 7-146', 'Solo Tier 4b y Stage V.'],
  ['Sustituir filtro de aceite del motor', '500', 'Motor – Lubricación', 'Elemento filtrante OEM', 'Pág. 7-148', 'Sustituir junto con el aceite del motor.'],
  ['Cambio de aceite del motor', '500', 'Motor – Lubricación', 'AKCELA NEXPLORE 10W-40', 'Pág. 7-149', 'Drenar en caliente. Rellenar hasta nivel correcto en varilla.'],
  ['Agregar aditivo para sistema de inyección del motor', '500', 'Motor – Sistema de inyección', 'Aditivo OEM aprobado', 'Pág. 7-151', 'Solo aditivo homologado por Case IH.'],
  ['Cambio de aceite – Caja de engranajes de la bomba', '500', 'Sistema hidráulico – Caja bomba', 'AKCELA GEAR 135H EP 85W-140 | 7,5 L', 'Pág. 7-152', 'Drenar en caliente. Verificar contaminación metálica.'],
  ['Cambio de aceite – Caja de transmisión del cortador de base', '500', 'Cortador de base – Caja transmisión', 'AKCELA GEAR 135H EP 85W-140', 'Pág. 7-154', 'Drenar en caliente.'],
  ['Cambio de aceite – Caja de engranajes del picador', '500', 'Picador – Caja engranajes', 'AKCELA GEAR 135H EP 85W-140 | 7,5 L', 'Pág. 7-156', 'Drenar en caliente. Inspeccionar viruta metálica.'],
  ['Inspeccionar sello de silicona del silenciador de escape', '500', 'Motor – Sistema de escape', 'Sellante de silicona OEM', 'Pág. 7-158', 'Revisar grietas. Aplicar sellante si es necesario.'],
  ['Verificar precarga del eje doble', '750', 'Tren de rodaje – Eje doble', 'Grasa Tutela Multi-Purpose GR-9', 'Pág. 7-162', 'Solo AUSTOFT 9900. Par tuerca almenada: 1200 N·m (885 lb·ft).'],
  ['Inspeccionar acumuladores hidráulicos', '1000', 'Sistema hidráulico – Acumuladores', 'Nitrógeno (precarga)', 'Pág. 7-163', 'Verificar presión de precarga con nitrógeno. Nunca usar oxígeno.'],
  ['Sustituir filtros de retorno del aceite hidráulico', '1000', 'Sistema hidráulico – Filtros de retorno', 'Elemento filtrante OEM', 'Pág. 7-165', 'Sustituir elementos completos. Verificar contaminación.'],
  ['Sustituir filtro de presión del sistema hidráulico', '1000', 'Sistema hidráulico – Filtro de presión', 'Elemento filtrante OEM', 'Pág. 7-171', 'Verificar que no haya indicador de by-pass activado.'],
  ['Acondicionamiento de la oruga', '1500', 'Tren de rodaje – Oruga', '', 'Pág. 7-173', 'Solo AUSTOFT 9900. Verificar desgaste de eslabones y rodillos.'],
  ['Sustituir cojinete prefiltro neumático del motor', '1500', 'Motor – Filtración de aire', 'Cojinete OEM', 'Pág. 7-173', 'Verificar estado del precleaner rotativo.'],
  ['Sustituir cartuchos del filtro de aire del motor (principal y secundario)', '1500', 'Motor – Filtración de aire', 'Cartuchos OEM (principal + seguridad)', 'Pág. 7-174', 'Sustituir cartucho de seguridad junto con el principal.'],
  ['Ajustar holgura de válvulas del motor', '2000', 'Motor – Tren de válvulas', '', 'Pág. 7-176', 'Motor frío. Registrar mediciones. Taller recomendado.'],
  ['Sustituir cubierta del respiradero del accionamiento de la bomba', '2000', 'Sistema hidráulico – Accionamiento bomba', 'Elemento filtrante / tapa OEM', 'Pág. 7-177', 'Limpiar zona antes de retirar la cubierta.'],
  ['Drenar líquido del depósito de combustible', '3000', 'Sistema de combustible – Depósito', 'Combustible diésel', 'Pág. 7-178', 'Drenar sedimentos y agua. Limpiar fondo. También entre temporadas.'],
  ['Drenar y limpiar depósito DEF/AdBlue/ARLA', '3000', 'Motor – Sistema SCR', 'DEF / AdBlue / ARLA 32', 'Pág. 7-179', 'Solo Tier 3, 4b, Stage V. Limpiar con agua desmineralizada.'],
  ['Sustituir filtro de los conectores de líneas DEF', '3000', 'Motor – Sistema SCR', 'Elemento filtrante OEM', 'Pág. 7-180', 'Líneas de alimentación y retorno del módulo DEF.'],
  ['Sustituir filtro del módulo de suministro DEF/AdBlue', '3000', 'Motor – Sistema SCR', 'Elemento filtrante OEM', 'Pág. 7-182', 'No reutilizar. Verificar ausencia de fugas.'],
  ['Sustituir filtro de aceite de línea del picador', '3000', 'Picador – Circuito de aceite', 'Elemento filtrante OEM', 'Pág. 7-185', 'Junto con revisión del aceite del picador.'],
  ['Análisis de calidad del aceite hidráulico', '4000', 'Sistema hidráulico – Depósito', 'Aceite hidráulico ISO VG 46', 'Pág. 7-188', 'Muestra para laboratorio. Cambiar si está degradado. También entre temporadas.'],
  ['Sustituir filtro de aspiración del aceite hidráulico', '4000', 'Sistema hidráulico – Filtro de aspiración', 'Elemento filtrante OEM', 'Pág. 7-189', 'Limpiar malla de aspiración.'],
  ['Sustituir filtro del respiradero del depósito de combustible', '4000', 'Sistema de combustible – Depósito', 'Elemento filtrante OEM', 'Pág. 7-194', 'No obstruir durante la instalación.'],
  ['Sustituir filtro del respiradero del accionamiento de la bomba', '4000', 'Sistema hidráulico – Accionamiento bomba', 'Elemento filtrante OEM', 'Pág. 7-195', 'Verificar mirilla de nivel al mismo tiempo.'],
  ['Sustituir filtro del respiradero del depósito DEF', '4000', 'Motor – Sistema SCR', 'Elemento filtrante OEM', 'Pág. 7-196', 'Solo Tier 3, 4b y Stage V.'],
  ['Inspeccionar almohadillas de fijación (motor, cabina, radiador)', '4000', 'Chasis – Montajes antivibratorios', '', 'Pág. 7-197', 'Verificar agrietamiento, deformación y pernos.'],
  ['Cambio de refrigerante del motor', '4000', 'Motor – Sistema de enfriamiento', 'Refrigerante OAT (vida extendida)', 'Pág. 7-198', 'Enjuagar circuito. Mezclar con agua desmineralizada.'],
  ['Inspeccionar componentes internos de la transmisión final planetaria', '5000', 'Transmisión – Transmisiones finales', '', 'Pág. 7-201', 'Taller especializado. Revisar engranajes y rodamientos.'],
  ['Sustituir tacos de montaje de la cabina en el chasis', '7000', 'Cabina – Montajes antivibratorios', 'Taco antivibratorio OEM', 'Pág. 7-201', 'Reemplazar por fatiga aunque no muestren daño visible.'],
  ['Sustituir tacos de montaje del motor en el chasis', '10000', 'Motor – Montajes antivibratorios', 'Taco antivibratorio OEM', 'Pág. 7-202', 'Taller especializado. Verificar alineación del motor.'],
  ['Sustituir almohadillas de fijación del compartimento del radiador', '20000', 'Sistema de refrigeración – Radiador', 'Almohadilla antivibratorio OEM', 'Pág. 7-202', 'Verificar alineación del radiador tras la sustitución.'],
  ['Verificar ajuste de presión Feed Rate Control – Picador', 'Operativo', 'Picador – Sistema de control electrónico', '', 'Procedimiento 108166243', 'Ajuste en pantalla: Toolbox → Chopper → Feed Rate Control Chopper Press. Valor: 150 bar (2175 psi). Verificar al inicio de temporada.'],
  ['Calibración de las bombas de la transmisión – Pump Balance', 'Operativo', 'Sistema hidráulico – Bombas de transmisión', '', 'Procedimiento 106523096', 'En pantalla: Calibrations → Pump Balance → Continue. Máquina plana, freno accionado, ralentí. Tras intervenciones en bombas.'],
]

// ─── Plan PUMA 165/180/195/210 (Sección 4 del manual 84170978) ───────────────

const PUMA_TASKS: PlanRow[] = [
  ['Verificar nivel de aceite del motor (rodaje)', 'PRIMERAS 50 HORAS', 'Motor – Lubricación', 'Aceite SAE 15W-40 / 10W-30 (Akcela Nº1)', 'Pág. 4-2', 'Comprobar durante las primeras 50 h. Concesionario autorizado.'],
  ['Cambiar filtros de aceite hidráulico (primera vez)', 'PRIMERAS 50 HORAS', 'Sistema hidráulico – Filtros', 'Elemento filtrante OEM', 'Pág. 4-2', 'Primera vez. Continuar cada 600 h.'],
  ['Verificar nivel aceite transmisión / eje trasero / hidráulico (rodaje)', 'PRIMERAS 50 HORAS', 'Transmisión / Hidráulico', 'Aceite SAE 10W-30 (Akcela Nexplore)', 'Pág. 4-2', 'Cilindros extendidos y motor apagado ≥5 min.'],
  ['Limpiar filtro de la TdF delantera', 'PRIMERAS 50 HORAS', 'TdF delantera – Filtro', '', 'Pág. 4-2', 'Solo tractores con TdF delantera.'],
  ['Verificar nivel de aceite de la TdF delantera', 'PRIMERAS 50 HORAS', 'TdF delantera – Lubricación', 'Aceite SAE 10W-30 (Akcela Nexplore)', 'Pág. 4-2', 'Tapón combinado nivel/llenado.'],
  ['Verificar nivel de aceite diferencial tracción total', 'PRIMERAS 50 HORAS', 'Eje delantero – Diferencial', 'Aceite SAE 10W-30 (Akcela Nexplore)', 'Pág. 4-2', 'Todos los modelos con tracción total.'],
  ['Verificar nivel de aceite del buje eje tracción total', 'PRIMERAS 50 HORAS', 'Eje delantero – Bujes', 'Aceite SAE 10W-30 (Akcela Nexplore)', 'Pág. 4-2', 'Tapón en posición de las 3 en punto.'],
  ['Comprobar y ajustar freno de estacionamiento (rodaje)', 'PRIMERAS 50 HORAS', 'Frenos – Estacionamiento', '', 'Pág. 4-2', 'Ajustar cables hasta 4ª muesca del trinquete.'],
  ['Comprobar conexiones de entrada de aire del motor (rodaje)', 'PRIMERAS 50 HORAS', 'Motor – Admisión de aire', '', 'Pág. 4-2', 'Verificar firmeza de abrazaderas y manguitos.'],
  ['Comprobar par de tornillos del colector de escape', 'PRIMERAS 50 HORAS', 'Motor – Escape', '', 'Pág. 4-2', 'Llave dinamométrica. Par especificado.'],
  ['Revisar correa politrapezoidal (rodaje)', 'PRIMERAS 50 HORAS', 'Motor – Correa politrapezoidal', '', 'Pág. 4-2', 'Verificar grietas, cortes y tensor.'],
  ['Comprobar tensión correa compresor frenos neumáticos (rodaje)', 'PRIMERAS 50 HORAS', 'Frenos neumáticos – Compresor', '', 'Pág. 4-2', 'Solo con frenos de remolque neumáticos.'],
  ['Apretar conexiones de manguitos del sistema de refrigeración', 'PRIMERAS 50 HORAS', 'Motor – Sistema de refrigeración', '', 'Pág. 4-2', 'Todas las abrazaderas del circuito.'],
  ['Comprobar par tornillos de montaje de la cabina / ROPS', 'PRIMERAS 50 HORAS', 'Cabina / ROPS', '', 'Pág. 4-2', 'Llave dinamométrica. Crítico para seguridad.'],
  ['Comprobar par tornillos pesos delanteros', 'PRIMERAS 50 HORAS', 'Bastidor delantero – Pesos', '', 'Pág. 4-2', 'Solo con contrapesos delanteros.'],
  ['Comprobar nivel de refrigerante del motor', '10', 'Motor – Sistema de refrigeración', 'Anticongelante Akcela Premium MS1710 50% + agua 50%', 'Pág. 4-17', 'Depósito de expansión con motor frío. Corregir fugas.'],
  ['Comprobar nivel de aceite del motor', '10', 'Motor – Lubricación', 'Aceite SAE 15W-40 (Akcela Nº1 MS1121)', 'Pág. 4-18', 'Tractor nivelado, motor apagado ≥5 min. No sobrepasar MAX.'],
  ['Comprobar nivel depósito lavaparabrisas', '10', 'Cabina – Lavaparabrisas', 'Solución lavaparabrisas', 'Pág. 4-18', 'Mismo depósito para delantero y trasero.'],
  ['Inspeccionar/limpiar radiador, intercooler, enfriador de aceite y condensador A/C', '10', 'Motor – Refrigeración / A/C', '', 'Pág. 4-19', 'Limpiar con aire ≤7 bar si hay obstrucción.'],
  ['Limpiar filtros de aire de la cabina (condición polvorienta)', '10', 'Cabina – Climatización', '', 'Pág. 4-20', 'Apagar ventilador y cerrar ventanas antes.'],
  ['Drenar/comprobar filtro de combustible/decantador de agua', '10', 'Motor – Sistema de combustible', 'Combustible diésel', 'Pág. 4-16', 'Drenar si aparece indicador de agua. Sistema autopurga.'],
  ['Lubricar todos los engrasadores (engrase general)', '50', 'General – Puntos de engrase', 'Grasa NLGI 2 (Akcela 251 HEP Universal)', 'Pág. 4-22', 'Brazos elevación, tirantes, tercer punto, ejes, cilindros dirección, enganche.'],
  ['Comprobar apriete tuercas de ruedas delanteras y traseras', '50', 'Ruedas – Fijación', '', 'Pág. 4-27', 'Disco→buje 210-500 Nm según configuración. Disco→llanta 250 Nm.'],
  ['Comprobar presión y estado de los neumáticos', '50', 'Neumáticos', '', 'Pág. 4-28', 'Regular presión según carga. Inspeccionar banda y flancos.'],
  ['Comprobar tensión correa compresor frenos neumáticos de remolque', '100', 'Frenos neumáticos – Compresor', '', 'Pág. 4-29', 'Solo con frenos de remolque neumáticos. Sustituir si hay grietas.'],
  ['Comprobar nivel electrolito batería (climas tropicales)', '300', 'Sistema eléctrico – Batería', 'Agua destilada o desmineralizada', 'Pág. 4-30', 'Solo climas tropicales. No usar agua corriente.'],
  ['Revisar correa politrapezoidal', '300', 'Motor – Correa politrapezoidal', '', 'Pág. 4-31', 'Inspeccionar grietas, cortes y tensor automático.'],
  ['Comprobar nivel aceite transmisión / eje trasero / sistema hidráulico', '300', 'Transmisión / Hidráulico', 'Aceite SAE 10W-30 (Akcela Nexplore MAT 3525)', 'Pág. 4-31', 'Cilindros extendidos, superficie nivelada, motor apagado ≥5 min.'],
  ['Comprobar y ajustar freno de estacionamiento', '300', 'Frenos – Estacionamiento', '', 'Pág. 4-32', 'Cables con freno en 4ª muesca. Verificar frenada recta.'],
  ['Comprobar nivel aceite caja de cambios TdF delantera', '300', 'TdF delantera – Lubricación', 'Aceite SAE 10W-30 (Akcela Nexplore MAT 3525)', 'Pág. 4-32', 'Solo tractores con TdF delantera.'],
  ['Cambio de aceite y filtro del motor', '600', 'Motor – Lubricación', 'Aceite SAE 15W-40 (Akcela Nº1 MS1121) | 15 L', 'Pág. 4-33', 'Drenar en caliente. Cambiar filtro. Arrancar 3 min y verificar fugas.'],
  ['Cambio filtros de aceite hidráulico y de transmisión', '600', 'Hidráulico / Transmisión – Filtros', 'Elemento filtrante OEM', 'Pág. 4-35', 'Dos filtros: principal (cartucho) y filtro de carga (desechable).'],
  ['Cambio elemento exterior filtro de aire del motor', '600', 'Motor – Filtración de aire', 'Elemento exterior OEM', 'Pág. 4-36', 'Limpiar carcasa. No retirar elemento interior.'],
  ['Comprobar conexiones aspiración filtro del motor', '600', 'Motor – Admisión de aire', '', 'Pág. 4-36', 'Abrazaderas y manguitos en ambos lados.'],
  ['Cambio elementos filtros de combustible previo y secundario', '600', 'Motor – Sistema de combustible', 'Elementos OEM (prefiltro + secundario)', 'Pág. 4-38', 'Lubricar junta con aceite. Cebar sistema tras el cambio.'],
  ['Comprobar nivel aceite bujes y eje delantero tracción total', '600', 'Eje delantero – Bujes / Diferencial', 'Aceite SAE 10W-30 | Eje: 11 L | Bujes 2,3-3,8 L', 'Pág. 4-39', 'Tapón buje a las 3 en punto. Verificar eje y ambos bujes.'],
  ['Cambio aceite y filtro caja reductora TdF delantera', '600', 'TdF delantera – Lubricación', 'Aceite SAE 10W-30 (Akcela Nexplore) | 3,05 L', 'Pág. 4-40', 'Drenar, limpiar filtro interno con disolvente, rellenar.'],
  ['Cambio filtros de aire de la cabina', '600', 'Cabina – Climatización', 'Elementos OEM (2 externos + 1 interno)', 'Pág. 4-41', 'Flecha de flujo hacia arriba (ext.) / parte trasera (int.).'],
  ['Cambio aceite y filtros transmisión / eje trasero / sistema hidráulico', '1200', 'Transmisión / Hidráulico', 'Aceite SAE 10W-30 (Akcela Nexplore MAT 3525) | 100 L', 'Pág. 4-42', 'O cada 12 meses. Drenar por dos tapones. Cambiar filtros antes de rellenar.'],
  ['Cambio aceite diferencial eje tracción total', '1200', 'Eje delantero – Diferencial', 'Aceite SAE 10W-30 (Akcela Nexplore) | 11 L', 'Pág. 4-44', 'O cada 12 meses. Rellenar hasta borde del orificio de nivel.'],
  ['Cambio aceite buje planetario tracción total', '1200', 'Eje delantero – Bujes', 'Aceite SAE 10W-30 | s/frenos 2,3 L / c/frenos 3,8 L por buje', 'Pág. 4-45', 'O cada 12 meses. Drenar con tapón abajo. Rellenar con tapón a las 3.'],
  ['Comprobar nivel electrolito batería (clima templado)', '1200', 'Sistema eléctrico – Batería', 'Agua destilada o desmineralizada', 'Pág. 4-46', 'O cada 12 meses. Limpiar terminales con vaselina.'],
  ['Cambio filtros hidráulico/transmisión (gran capacidad)', '1200', 'Hidráulico / Transmisión – Filtros', 'Filtro de aspiración de gran capacidad OEM', 'Pág. 4-48', 'O cada 12 meses. Tractores con filtro de gran capacidad.'],
  ['Cambio de refrigerante del motor', '1200', 'Motor – Sistema de refrigeración', 'Anticongelante Akcela Premium MS1710 50% + agua blanda 50% | 26 L', 'Pág. 4-49', 'O cada 2 años. Lavar sistema. Rellenar lentamente para purgar aire.'],
  ['Cambio elemento interior filtro de aire del motor', '1200', 'Motor – Filtración de aire', 'Elemento interior OEM (seguridad)', 'Pág. 4-53', 'O cada 2 años. Concesionario autorizado. Limpiar carcasa.'],
  ['Comprobar holgura de taqués (válvulas)', '1200', 'Motor – Tren de válvulas', '', 'Pág. 4-54', 'O cada 2 años. Herramientas especiales. Concesionario autorizado.'],
  ['Cambio filtro del respiradero del motor', '1200', 'Motor – Ventilación del cárter', 'Elemento OEM', 'Pág. 4-54', 'O cada 2 años. Manchas de aceite en regulador indican cambio.'],
  ['Cambio depósito evaporador frenos neumáticos', '1200', 'Frenos neumáticos – Depósito evaporador', 'Depósito evaporador OEM', 'Pág. 4-55', 'O cada 2 años. Solo con frenos neumáticos. Purgar presión antes.'],
  ['Mantenimiento del sistema de aire acondicionado', 'CADA 3 AÑOS', 'Cabina – Aire acondicionado', 'Aceite refrigerante PAG-E13 ISO100', 'Pág. 4-56', 'Cambiar receptor/secador. Solo taller autorizado.'],
  ['Inspeccionar/limpiar prefiltro y colector de agua del combustible', 'CUANDO SEA NECESARIO', 'Motor – Sistema de combustible', 'Combustible diésel limpio', 'Pág. 4-57', 'Si se observa agua en la cuba de vidrio. Limpiar gasa.'],
  ['Purgar aire del sistema de inyección de combustible', 'CUANDO SEA NECESARIO', 'Motor – Sistema de combustible', '', 'Pág. 4-58', 'Tras mantenimiento del sistema o quedarse sin combustible.'],
  ['Calibración del embrague – Transmisión Full Powershift', 'CUANDO SEA NECESARIO', 'Transmisión – Full Powershift', '', 'Pág. 4-59', 'Cada 50 h de rodaje y al degradarse calidad de cambios. T° aceite 20-50 °C.'],
  ['Comprobar y ajustar frenos de pedal', 'CUANDO SEA NECESARIO', 'Frenos – Pedal', '', 'Pág. 4-61', 'Verificar equilibrio y recorrido libre.'],
  ['Comprobar y lubricar enganche automático de remolque', 'CUANDO SEA NECESARIO', 'Enganche trasero – Remolque', 'Grasa NLGI 2', 'Pág. 4-62', 'Verificar enclavamiento. Lubricar según tipo.'],
  ['Vaciar botellas de drenaje de válvulas de control remoto', 'CUANDO SEA NECESARIO', 'Sistema hidráulico – Válvulas remotas', '', 'Pág. 4-63', 'Vaciar y limpiar si están llenas. Inspeccionar fugas.'],
  ['Ajuste de la suspensión de la cabina', 'CUANDO SEA NECESARIO', 'Cabina – Suspensión', '', 'Pág. 4-64', 'Según peso del operador. Verificar amortiguación y altura.'],
  ['Ajustar luces de carretera y de trabajo', 'CUANDO SEA NECESARIO', 'Sistema eléctrico – Iluminación', '', 'Pág. 4-65', 'Verificar orientación y foco.'],
  ['Sustitución de bombillas', 'CUANDO SEA NECESARIO', 'Sistema eléctrico – Iluminación', 'Bombillas OEM', 'Pág. 4-66', 'Consultar tabla. Desconectar batería antes.'],
  ['Sustitución de fusibles', 'CUANDO SEA NECESARIO', 'Sistema eléctrico – Fusibles', 'Fusibles OEM según amperaje', 'Pág. 4-69', 'Panel derecho cabina o caja Maxi en bastidor batería.'],
  ['Limpieza del tractor', 'CUANDO SEA NECESARIO', 'General – Limpieza', '', 'Pág. 4-75', 'No usar agua a presión en electrónicos. No agua fría a motor caliente.'],
  ['Almacenamiento del tractor', 'CUANDO SEA NECESARIO', 'General – Almacenamiento', 'Aceite, grasa, refrigerante según especificaciones', 'Pág. 4-77', 'Limpiar, lubricar, proteger metales, cubrir escape y admisión.'],
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte el intervalo crudo a frequencyType/Value + label */
function parseInterval(raw: string): { type: string; value: number | null; label: string } {
  const num = Number(raw)
  if (!isNaN(num) && num > 0) return { type: 'hours', value: num, label: `CADA ${num.toLocaleString('es-CO')} HORAS` }
  if (raw.startsWith('PRIMERAS')) {
    const v = Number(raw.replace(/\D/g, ''))
    return { type: 'first_hours', value: v || null, label: raw }
  }
  if (raw === 'CADA 3 AÑOS') return { type: 'months', value: 36, label: raw }
  if (raw === 'Operativo' || raw === 'CUANDO SEA NECESARIO') return { type: 'condition', value: null, label: raw }
  return { type: 'condition', value: null, label: raw }
}

/** Repuestos/insumos únicos derivados de los fluidos de los planes */
const DERIVED_PARTS: Array<{ name: string; category: string; unit: string }> = [
  { name: 'Aceite motor AKCELA NEXPLORE 10W-40', category: 'Lubricantes', unit: 'liter' },
  { name: 'Aceite motor Akcela Nº1 SAE 15W-40 (MS1121)', category: 'Lubricantes', unit: 'liter' },
  { name: 'Aceite AKCELA GEAR 135H EP 85W-140', category: 'Lubricantes', unit: 'liter' },
  { name: 'Aceite Tutela Hypoide EP 85W-140 NT', category: 'Lubricantes', unit: 'liter' },
  { name: 'Aceite Akcela Nexplore SAE 10W-30 (MAT 3525)', category: 'Lubricantes', unit: 'liter' },
  { name: 'Aceite hidráulico ISO VG 46', category: 'Lubricantes', unit: 'liter' },
  { name: 'Refrigerante OAT vida extendida', category: 'Refrigerantes', unit: 'liter' },
  { name: 'Anticongelante Akcela Premium MS1710', category: 'Refrigerantes', unit: 'liter' },
  { name: 'DEF / AdBlue / ARLA 32', category: 'Fluidos SCR', unit: 'liter' },
  { name: 'Grasa multipropósito NLGI 2', category: 'Grasas', unit: 'kg' },
  { name: 'Grasa Akcela 251 HEP Universal NLGI 2', category: 'Grasas', unit: 'kg' },
  { name: 'Grasa Tutela Multi-Purpose GR-9', category: 'Grasas', unit: 'kg' },
  { name: 'Filtro de aceite motor A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro de combustible principal A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro separador de agua A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Filtros de retorno hidráulico A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro de presión hidráulico A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Cartucho filtro de aire motor A9900 (principal)', category: 'Filtros', unit: 'unit' },
  { name: 'Cartucho filtro de aire motor A9900 (seguridad)', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro de aire cabina A9900', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro de aceite motor PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Prefiltro de combustible PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro secundario de combustible PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro hidráulico principal PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Filtro de carga transmisión PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Elemento exterior filtro de aire PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Elemento interior filtro de aire PUMA', category: 'Filtros', unit: 'unit' },
  { name: 'Filtros de aire cabina PUMA (kit 2 ext + 1 int)', category: 'Filtros', unit: 'unit' },
  { name: 'Cuchillas cortador de base A9900', category: 'Desgaste', unit: 'unit' },
  { name: 'Cuchillas picador A9900', category: 'Desgaste', unit: 'unit' },
  { name: 'Cuchillas despuntador A9900', category: 'Desgaste', unit: 'unit' },
  { name: 'Cadena del elevador A9900', category: 'Desgaste', unit: 'unit' },
  { name: 'Correa politrapezoidal PUMA', category: 'Correas', unit: 'unit' },
  { name: 'Aceite refrigerante PAG-E13 ISO100 (A/C)', category: 'Refrigerantes', unit: 'liter' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seed de planes reales Case IH...')

  const orgRecord = await db.organization.findFirst()
  if (!orgRecord) throw new Error('No hay organización. Ejecutar seed principal primero.')
  const org = orgRecord

  // 1. Marca y categorías
  const caseIH = await db.brand.upsert({
    where: { name: 'CASE IH' },
    update: {},
    create: { name: 'CASE IH', code: 'CASEIH', country: 'US' },
  })

  const catCosechadora = await db.assetCategory.upsert({
    where: { code: 'COSECHADORA' },
    update: {},
    create: { name: 'Cosechadora de caña', code: 'COSECHADORA', icon: 'tractor' },
  })
  const catTractor = await db.assetCategory.upsert({
    where: { code: 'TRACTOR' },
    update: {},
    create: { name: 'Tractor agrícola', code: 'TRACTOR', icon: 'tractor' },
  })

  // 2. Modelos de activo
  async function upsertModel(name: string, code: string, categoryId: string, specs: object) {
    const existing = await db.assetModel.findFirst({ where: { name, brandId: caseIH.id } })
    if (existing) return existing
    return db.assetModel.create({
      data: { brandId: caseIH.id, categoryId, name, code, specs: JSON.stringify(specs) },
    })
  }

  const mA9900 = await upsertModel('A9900 / Austoft 9900', 'A9900', catCosechadora.id, {
    tipo: 'Cosechadora de caña de azúcar', motor: 'FPT Cursor 9 Tier 3/4b/Stage V',
    manual: 'Manual del Operador A9900 — Sección 7',
  })
  const mPuma165 = await upsertModel('Puma 165', 'PUMA165', catTractor.id, { potencia: '165 HP', manual: 'Print 84170978 — Sección 4' })
  const mPuma180 = await upsertModel('Puma 180', 'PUMA180', catTractor.id, { potencia: '180 HP', manual: 'Print 84170978 — Sección 4' })
  const mPuma195 = await upsertModel('Puma 195', 'PUMA195', catTractor.id, { potencia: '195 HP', manual: 'Print 84170978 — Sección 4' })
  const mPuma210 = await upsertModel('Puma 210', 'PUMA210', catTractor.id, { potencia: '210 HP', manual: 'Print 84170978 — Sección 4' })

  // 3. Documentos (manuales)
  async function upsertDocument(name: string, modelId: string, brand: string, model: string) {
    const existing = await db.document.findFirst({ where: { name } })
    if (existing) return existing
    return db.document.create({
      data: {
        organizationId: org.id, modelId, name, type: 'operator_manual',
        url: `/docs/manuales/${name.replace(/\s+/g, '_')}.pdf`,
        brand, model, language: 'es',
      },
    })
  }
  await upsertDocument('Manual del Operador A9900', mA9900.id, 'CASE IH', 'A9900 / Austoft 9900')
  await upsertDocument('Manual del Operario Puma 165-180-195-210', mPuma165.id, 'CASE IH', 'Puma 165/180/195/210')

  // 4. Planes de mantenimiento con tareas reales
  async function upsertPlan(name: string, description: string, modelIds: string[], tasks: PlanRow[]) {
    let plan = await db.maintenancePlan.findFirst({ where: { name, organizationId: org.id } })
    if (plan) {
      // Limpiar tareas para recargar (idempotencia destructiva controlada solo en tareas del plan)
      await db.maintenancePlanTask.deleteMany({ where: { planId: plan.id } })
    } else {
      plan = await db.maintenancePlan.create({
        data: {
          organizationId: org.id, name, description, type: 'preventive',
          models: { connect: modelIds.map(id => ({ id })) },
        },
      })
    }

    let order = 0
    for (const [taskName, rawInterval, system, fluid, page, notes] of tasks) {
      const { type, value, label } = parseInterval(rawInterval)
      await db.maintenancePlanTask.create({
        data: {
          planId: plan.id,
          name: taskName,
          system,
          frequencyType: type,
          frequencyValue: value,
          frequencyUnit: type === 'months' ? 'months' : 'hours',
          lubricant: fluid || null,
          manualRef: page,
          notes: `${label}${notes ? ' — ' + notes : ''}`,
          criticality: system.includes('Seguridad') || system.includes('ROPS') ? 'critical'
            : (value && value <= 50) ? 'high' : 'medium',
          order: order++,
        },
      })
    }
    console.log(`  ✓ Plan "${name}": ${tasks.length} tareas`)
    return plan
  }

  const planA9900 = await upsertPlan(
    'Plan Case IH A9900 / Austoft 9900 (oficial)',
    'Plan de mantenimiento extraído del Manual del Operador A9900, Sección 7. 78 actividades en 13 intervalos: primeras 20/50/500 h, cada 25/50/250/500/750/1.000/1.500/2.000/3.000/4.000/5.000/7.000/10.000/20.000 h + verificaciones operativas.',
    [mA9900.id], A9900_TASKS,
  )
  const planPuma = await upsertPlan(
    'Plan Case IH Puma 165/180/195/210 (oficial)',
    'Plan de mantenimiento extraído del Manual de Empleo y Cuidado Print 84170978, Sección 4. 61 actividades: primeras 50 h, cada 10/50/100/300/600/1.200 h, cada 3 años y por condición.',
    [mPuma165.id, mPuma180.id, mPuma195.id, mPuma210.id], PUMA_TASKS,
  )

  // 5. Repuestos/insumos derivados
  let partsCreated = 0
  for (const p of DERIVED_PARTS) {
    const existing = await db.part.findFirst({ where: { name: p.name, organizationId: org.id } })
    if (!existing) {
      await db.part.create({
        data: {
          organizationId: org.id, brandId: caseIH.id,
          name: p.name, category: p.category, unit: p.unit,
          currentStock: Math.floor(Math.random() * 20) + 5,
          minStock: 5,
          averageCost: p.category === 'Lubricantes' ? 45000 : p.category === 'Filtros' ? 180000 : 95000,
          criticality: p.category === 'Filtros' ? 'high' : 'medium',
        },
      })
      partsCreated++
    }
  }
  console.log(`  ✓ Repuestos derivados: ${partsCreated} nuevos`)

  // 6. Vincular plan a activos existentes + generar ScheduledMaintenance
  const assets = await db.asset.findMany({ where: { organizationId: org.id, isActive: true }, take: 100 })
  let schedCreated = 0

  for (const asset of assets) {
    // Cosechadoras → plan A9900, tractores → plan Puma (heurística por nombre)
    const isHarvester = /a9900|austoft|cosechadora/i.test(asset.name)
    const plan = isHarvester ? planA9900 : planPuma
    const modelId = isHarvester ? mA9900.id : mPuma180.id

    // Vincular modelo si no tiene
    if (!asset.modelId) {
      await db.asset.update({ where: { id: asset.id }, data: { modelId, brandId: caseIH.id, categoryId: isHarvester ? catCosechadora.id : catTractor.id } })
    }

    await db.maintenancePlanAsset.upsert({
      where: { planId_assetId: { planId: plan.id, assetId: asset.id } },
      update: {},
      create: { planId: plan.id, assetId: asset.id },
    })

    // Generar próximos mantenimientos por horómetro (solo tareas con frequencyValue)
    const tasks = await db.maintenancePlanTask.findMany({
      where: { planId: plan.id, frequencyType: 'hours', frequencyValue: { not: null } },
    })
    const existing = await db.scheduledMaintenance.count({ where: { assetId: asset.id } })
    if (existing === 0) {
      for (const t of tasks) {
        const fv = t.frequencyValue!
        // Próximo múltiplo del intervalo por encima del horómetro actual
        const nextDue = Math.ceil((asset.currentHours + 1) / fv) * fv
        const status = nextDue - asset.currentHours <= fv * 0.1 ? 'due_soon' : 'pending'
        await db.scheduledMaintenance.create({
          data: {
            organizationId: org.id, assetId: asset.id,
            planId: plan.id, planTaskId: t.id,
            title: t.name, system: t.system,
            intervalLabel: `CADA ${fv.toLocaleString('es-CO')} HORAS`,
            dueHours: nextDue, status,
            estimatedHours: t.estimatedHours,
          },
        })
        schedCreated++
      }
    }
  }
  console.log(`  ✓ Mantenimientos programados generados: ${schedCreated}`)

  console.log('✅ Seed de planes completado.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
