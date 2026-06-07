"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var SYSTEMS = [
    { name: 'Sistema Motor', components: ['Motor Diésel', 'Sistema de Inyección', 'Sistema de Refrigeración', 'Admisión/Escape'] },
    { name: 'Sistema Hidráulico', components: ['Bombas Hidráulicas', 'Motores Hidráulicos', 'Bloques de Válvulas', 'Cilindros', 'Tanque', 'Filtros y Mangueras'] },
    { name: 'Sistema de Transmisión / Rodaje', components: ['Orugas / Llantas', 'Mandos Finales', 'Motores de Traslación', 'Cajas de Engranajes'] },
    { name: 'Sistema Eléctrico / Electrónico', components: ['Baterías', 'Alternador', 'Mazo de Cables', 'Sensores', 'Módulos Electrónicos', 'Iluminación'] },
    { name: 'Sistema de Corte Base', components: ['Discos de Corte Base', 'Motores de Corte', 'Caja de Transmisión del Corte Base'] },
    { name: 'Sistema de Alimentación', components: ['Rolos Alimentadores', 'Motores de Alimentación'] },
    { name: 'Sistema de Troceado', components: ['Tambores Troceadores (Chopper)', 'Cuchillas', 'Volante', 'Motores del Troceador'] },
    { name: 'Sistema de Extracción', components: ['Extractor Primario', 'Extractor Secundario', 'Ventiladores', 'Motores de Extracción'] },
    { name: 'Sistema de Elevación', components: ['Cadena del Elevador', 'Tablillas/Paletas', 'Motor del Elevador'] },
    { name: 'Cabina y Estructura', components: ['Controles', 'Aire Acondicionado', 'Chasis', 'Paneles'] }
];
function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var org, user, clients, assets, technicians, i, client, asset, tech, now, scheduledDate, dueDate, isCompleted, project, numActivities, j, sys, comp, activityTech, actStart, actEnd, progress, estimatedHours, actualHours, task, numSubtasks, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Iniciando carga de datos de proyectos demo...');
                    return [4 /*yield*/, prisma.organization.findFirst()];
                case 1:
                    org = _a.sent();
                    if (!org)
                        throw new Error('No hay organización');
                    return [4 /*yield*/, prisma.user.findFirst()];
                case 2:
                    user = _a.sent();
                    if (!user)
                        throw new Error('No hay usuarios creados');
                    return [4 /*yield*/, prisma.client.findMany()];
                case 3:
                    clients = _a.sent();
                    return [4 /*yield*/, prisma.asset.findMany()];
                case 4:
                    assets = _a.sent();
                    return [4 /*yield*/, prisma.technician.findMany()];
                case 5:
                    technicians = _a.sent();
                    if (clients.length === 0 || assets.length === 0 || technicians.length === 0) {
                        console.log('Asegúrate de tener clientes, activos y técnicos en la BD antes de correr este script.');
                        return [2 /*return*/];
                    }
                    i = 1;
                    _a.label = 6;
                case 6:
                    if (!(i <= 15)) return [3 /*break*/, 15];
                    client = clients[Math.floor(Math.random() * clients.length)];
                    asset = assets[Math.floor(Math.random() * assets.length)];
                    tech = technicians[Math.floor(Math.random() * technicians.length)];
                    now = new Date();
                    scheduledDate = new Date();
                    scheduledDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
                    dueDate = new Date(scheduledDate);
                    dueDate.setDate(dueDate.getDate() + 15 + Math.floor(Math.random() * 30));
                    isCompleted = Math.random() > 0.7;
                    return [4 /*yield*/, prisma.workOrder.create({
                            data: {
                                organizationId: org.id,
                                number: "PRJ-2026-".concat(String(i).padStart(3, '0')),
                                title: "Mantenimiento Mayor o Reparaci\u00F3n A9900 #".concat(i),
                                description: "Proyecto de reparaci\u00F3n y overhauling generado autom\u00E1ticamente.",
                                type: 'corrective',
                                priority: Math.random() > 0.5 ? 'high' : 'medium',
                                status: isCompleted ? 'completed' : 'in_progress',
                                clientId: client.id,
                                assetId: asset.id,
                                createdById: user.id,
                                assignedToId: tech.userId, // use userId because assignedTo references User, not Technician
                                scheduledDate: scheduledDate,
                                dueDate: dueDate,
                            }
                        })
                        // Generar de 5 a 15 actividades por proyecto
                    ];
                case 7:
                    project = _a.sent();
                    numActivities = Math.floor(Math.random() * 11) + 5;
                    j = 0;
                    _a.label = 8;
                case 8:
                    if (!(j < numActivities)) return [3 /*break*/, 14];
                    sys = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)];
                    comp = sys.components[Math.floor(Math.random() * sys.components.length)];
                    activityTech = technicians[Math.floor(Math.random() * technicians.length)];
                    actStart = getRandomDate(scheduledDate, new Date(scheduledDate.getTime() + (dueDate.getTime() - scheduledDate.getTime()) / 2));
                    actEnd = getRandomDate(actStart, dueDate);
                    progress = isCompleted ? 100 : Math.floor(Math.random() * 100);
                    estimatedHours = Math.floor(Math.random() * 20) + 4;
                    actualHours = progress > 0 ? (estimatedHours * (progress / 100)) + (Math.random() * 5) : 0;
                    return [4 /*yield*/, prisma.workOrderTask.create({
                            data: {
                                workOrderId: project.id,
                                name: "Revisi\u00F3n/Reparaci\u00F3n de ".concat(comp),
                                status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending',
                                order: j,
                                technicianId: activityTech.id,
                                startDate: actStart,
                                endDate: actEnd,
                                estimatedHours: estimatedHours,
                                actualHours: parseFloat(actualHours.toFixed(1)),
                                progress: progress,
                                system: sys.name,
                                component: comp,
                            }
                        })
                        // Generar sub-tareas
                    ];
                case 9:
                    task = _a.sent();
                    numSubtasks = Math.floor(Math.random() * 4) + 2;
                    k = 0;
                    _a.label = 10;
                case 10:
                    if (!(k < numSubtasks)) return [3 /*break*/, 13];
                    return [4 /*yield*/, prisma.workOrderSubtask.create({
                            data: {
                                taskId: task.id,
                                name: "Sub-tarea ".concat(k + 1, " para ").concat(comp),
                                isCompleted: progress === 100 || Math.random() > 0.5,
                                order: k
                            }
                        })];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    k++;
                    return [3 /*break*/, 10];
                case 13:
                    j++;
                    return [3 /*break*/, 8];
                case 14:
                    i++;
                    return [3 /*break*/, 6];
                case 15:
                    console.log('✅ Datos de proyectos demo generados exitosamente.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
