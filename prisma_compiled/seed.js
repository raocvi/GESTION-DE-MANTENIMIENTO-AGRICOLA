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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SEED — AgroMaint Pro
 * Datos iniciales para IMECOL S.A.S. con soporte a Proyectos/Actividades
 * Ejecución: npm run db:seed
 */
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var db = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var org, adminRole, supervisorRole, techRole, passwordHash, admin, supervisor, techUsers, techs, i, techUser, techRecord, isSpecialist, clients, i, client, caseIH, johnDeere, catCosechadora, catTractor, modelA9900, model8R, assets, i, isTractor, asset, i, prjNumber, existing, startDate, dueDate, workOrder, totalTasks, currentTaskStart, j, taskEnd, techAssigned, progress, status_1, task, i, otNumber, existing, i, otNumber, existing, closedDate, startDate, scheduledDate, isCorrective, actualHours, laborCost, partsCost;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🌱 Iniciando seed de AgroMaint Pro...\n');
                    return [4 /*yield*/, db.organization.upsert({
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
                    ];
                case 1:
                    org = _a.sent();
                    return [4 /*yield*/, db.role.upsert({
                            where: { name: 'admin' }, update: {},
                            create: { name: 'admin', displayName: 'Administrador', description: 'Acceso total', isSystem: true, permissions: '["*"]' },
                        })];
                case 2:
                    adminRole = _a.sent();
                    return [4 /*yield*/, db.role.upsert({
                            where: { name: 'supervisor' }, update: {},
                            create: { name: 'supervisor', displayName: 'Supervisor', description: 'Gestión', isSystem: true, permissions: '["*"]' },
                        })];
                case 3:
                    supervisorRole = _a.sent();
                    return [4 /*yield*/, db.role.upsert({
                            where: { name: 'technician' }, update: {},
                            create: { name: 'technician', displayName: 'Técnico', description: 'Ejecución', isSystem: true, permissions: '["*"]' },
                        })
                        // 3. Usuarios y Técnicos
                    ];
                case 4:
                    techRole = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash('AgroMaint2024!', 12)];
                case 5:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, db.user.upsert({
                            where: { email: 'admin@imecol.com.co' }, update: {},
                            create: { organizationId: org.id, email: 'admin@imecol.com.co', password: passwordHash, name: 'Administrador', isActive: true },
                        })];
                case 6:
                    admin = _a.sent();
                    return [4 /*yield*/, db.user.upsert({
                            where: { email: 'supervisor@imecol.com.co' }, update: {},
                            create: { organizationId: org.id, email: 'supervisor@imecol.com.co', password: passwordHash, name: 'Carlos Supervisor', isActive: true },
                        })];
                case 7:
                    supervisor = _a.sent();
                    techUsers = [];
                    techs = [];
                    i = 1;
                    _a.label = 8;
                case 8:
                    if (!(i <= 20)) return [3 /*break*/, 14];
                    return [4 /*yield*/, db.user.upsert({
                            where: { email: "tecnico".concat(i, "@imecol.com.co") }, update: {},
                            create: { organizationId: org.id, email: "tecnico".concat(i, "@imecol.com.co"), password: passwordHash, name: "T\u00E9cnico ".concat(i), isActive: true },
                        })];
                case 9:
                    techUser = _a.sent();
                    techUsers.push(techUser);
                    return [4 /*yield*/, db.technician.findFirst({ where: { userId: techUser.id } })];
                case 10:
                    techRecord = _a.sent();
                    if (!!techRecord) return [3 /*break*/, 12];
                    isSpecialist = i % 3 === 0;
                    return [4 /*yield*/, db.technician.create({
                            data: {
                                organizationId: org.id,
                                userId: techUser.id,
                                name: "T\u00E9cnico ".concat(i),
                                level: isSpecialist ? 'senior' : (i % 2 === 0 ? 'mid' : 'junior'),
                                position: isSpecialist ? 'Técnico Especialista' : 'Técnico de Campo',
                                educationLevel: isSpecialist ? 'Profesional' : 'Tecnólogo',
                                phone: "+57 300 000 ".concat(i.toString().padStart(4, '0')),
                                email: "tecnico".concat(i, "@imecol.com.co"),
                                specialty: JSON.stringify(isSpecialist ? ['Hidráulica Avanzada', 'Electrónica'] : ['Mecánica General']),
                                courses: JSON.stringify(['Inducción AgroMaint', isSpecialist ? 'Certificación CASE IH Expert' : 'Básico JOHN DEERE']),
                                certifications: JSON.stringify(['Trabajo en Alturas', 'ISO 9001']),
                            }
                        })];
                case 11:
                    techRecord = _a.sent();
                    _a.label = 12;
                case 12:
                    techs.push(techRecord);
                    _a.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 8];
                case 14:
                    clients = [];
                    i = 1;
                    _a.label = 15;
                case 15:
                    if (!(i <= 50)) return [3 /*break*/, 18];
                    return [4 /*yield*/, db.client.upsert({
                            where: { id: "client-".concat(i.toString().padStart(3, '0')) },
                            update: {},
                            create: {
                                id: "client-".concat(i.toString().padStart(3, '0')),
                                organizationId: org.id,
                                code: "CLI-".concat(i.toString().padStart(3, '0')),
                                name: "Agropecuaria Cliente ".concat(i),
                                contactName: "Contacto ".concat(i),
                                city: ['Medellín', 'Bogotá', 'Cali', 'Montería', 'Villavicencio'][i % 5],
                            },
                        })];
                case 16:
                    client = _a.sent();
                    clients.push(client);
                    _a.label = 17;
                case 17:
                    i++;
                    return [3 /*break*/, 15];
                case 18: return [4 /*yield*/, db.brand.upsert({ where: { name: 'CASE IH' }, update: {}, create: { name: 'CASE IH', code: 'CASEIH' } })];
                case 19:
                    caseIH = _a.sent();
                    return [4 /*yield*/, db.brand.upsert({ where: { name: 'JOHN DEERE' }, update: {}, create: { name: 'JOHN DEERE', code: 'JDEERE' } })];
                case 20:
                    johnDeere = _a.sent();
                    return [4 /*yield*/, db.assetCategory.upsert({ where: { code: 'COSE' }, update: {}, create: { code: 'COSE', name: 'Cosechadora' } })];
                case 21:
                    catCosechadora = _a.sent();
                    return [4 /*yield*/, db.assetCategory.upsert({ where: { code: 'TRAC' }, update: {}, create: { code: 'TRAC', name: 'Tractor' } })];
                case 22:
                    catTractor = _a.sent();
                    return [4 /*yield*/, db.assetModel.upsert({
                            where: { id: 'model-a9900' }, update: {},
                            create: { id: 'model-a9900', brandId: caseIH.id, categoryId: catCosechadora.id, name: 'A9900', code: 'A9900' }
                        })];
                case 23:
                    modelA9900 = _a.sent();
                    return [4 /*yield*/, db.assetModel.upsert({
                            where: { id: 'model-8r' }, update: {},
                            create: { id: 'model-8r', brandId: johnDeere.id, categoryId: catTractor.id, name: '8R 370', code: '8R' }
                        })
                        // 6. Activos (100+)
                    ];
                case 24:
                    model8R = _a.sent();
                    assets = [];
                    i = 1;
                    _a.label = 25;
                case 25:
                    if (!(i <= 100)) return [3 /*break*/, 28];
                    isTractor = i % 2 === 0;
                    return [4 /*yield*/, db.asset.upsert({
                            where: { id: "asset-".concat(i.toString().padStart(3, '0')) },
                            update: {},
                            create: {
                                id: "asset-".concat(i.toString().padStart(3, '0')),
                                organizationId: org.id,
                                clientId: clients[i % 50].id,
                                brandId: isTractor ? johnDeere.id : caseIH.id,
                                modelId: isTractor ? model8R.id : modelA9900.id,
                                categoryId: isTractor ? catTractor.id : catCosechadora.id,
                                internalCode: "EQ-".concat(i.toString().padStart(3, '0')),
                                serialNumber: "SN".concat(i, "XYZ"),
                                name: "".concat(isTractor ? 'Tractor' : 'Cosechadora', " ").concat(i),
                                operativeStatus: 'operative',
                                currentHours: 500 + i * 10,
                            },
                        })];
                case 26:
                    asset = _a.sent();
                    assets.push(asset);
                    _a.label = 27;
                case 27:
                    i++;
                    return [3 /*break*/, 25];
                case 28:
                    i = 1;
                    _a.label = 29;
                case 29:
                    if (!(i <= 10)) return [3 /*break*/, 38];
                    prjNumber = "PRJ-CORR-".concat(i.toString().padStart(3, '0'));
                    return [4 /*yield*/, db.workOrder.findUnique({ where: { number: prjNumber } })];
                case 30:
                    existing = _a.sent();
                    if (existing)
                        return [3 /*break*/, 37];
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - (Math.random() * 20));
                    dueDate = new Date(startDate);
                    dueDate.setDate(dueDate.getDate() + 30);
                    return [4 /*yield*/, db.workOrder.create({
                            data: {
                                organizationId: org.id,
                                number: prjNumber,
                                title: "Reparaci\u00F3n Mayor de Motor y Transmisi\u00F3n - Proyecto ".concat(i),
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
                    ];
                case 31:
                    workOrder = _a.sent();
                    totalTasks = 5 + Math.floor(Math.random() * 3);
                    currentTaskStart = new Date(startDate);
                    j = 1;
                    _a.label = 32;
                case 32:
                    if (!(j <= totalTasks)) return [3 /*break*/, 37];
                    taskEnd = new Date(currentTaskStart);
                    taskEnd.setDate(taskEnd.getDate() + (1 + Math.floor(Math.random() * 4)));
                    techAssigned = techs[Math.floor(Math.random() * techs.length)];
                    progress = i % 2 === 0 ? (j < totalTasks / 2 ? 100 : (j === Math.floor(totalTasks / 2) ? 50 : 0)) : 0;
                    status_1 = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'pending');
                    return [4 /*yield*/, db.workOrderTask.create({
                            data: {
                                workOrderId: workOrder.id,
                                name: "Fase ".concat(j, ": ").concat(['Desarme', 'Inspección', 'Rectificación', 'Armado', 'Pruebas', 'Pintura', 'Entrega'][j - 1] || 'Actividad general'),
                                status: status_1,
                                order: j,
                                technicianId: techAssigned.id,
                                startDate: currentTaskStart,
                                endDate: taskEnd,
                                estimatedHours: 16 + Math.random() * 24,
                                actualHours: progress > 0 ? 8 + Math.random() * 16 : 0,
                                progress: progress,
                            }
                        })
                        // Agregar repuestos a algunas tareas
                    ];
                case 33:
                    task = _a.sent();
                    if (!(j % 2 === 0)) return [3 /*break*/, 35];
                    return [4 /*yield*/, db.workOrderPart.create({
                            data: {
                                workOrderId: workOrder.id,
                                taskId: task.id,
                                partName: "Repuesto para Fase ".concat(j),
                                quantity: 2,
                                unitCost: 150000,
                                totalCost: 300000,
                            }
                        })];
                case 34:
                    _a.sent();
                    _a.label = 35;
                case 35:
                    currentTaskStart = new Date(taskEnd);
                    _a.label = 36;
                case 36:
                    j++;
                    return [3 /*break*/, 32];
                case 37:
                    i++;
                    return [3 /*break*/, 29];
                case 38:
                    i = 1;
                    _a.label = 39;
                case 39:
                    if (!(i <= 30)) return [3 /*break*/, 43];
                    otNumber = "OT-PREV-".concat(i.toString().padStart(3, '0'));
                    return [4 /*yield*/, db.workOrder.findUnique({ where: { number: otNumber } })];
                case 40:
                    existing = _a.sent();
                    if (existing)
                        return [3 /*break*/, 42];
                    return [4 /*yield*/, db.workOrder.create({
                            data: {
                                organizationId: org.id,
                                number: otNumber,
                                title: "Mantenimiento Preventivo 1000H - ".concat(i),
                                type: 'preventive',
                                status: 'pending',
                                priority: 'medium',
                                assetId: assets[30 + i].id,
                                clientId: clients[20 + (i % 20)].id,
                                createdById: supervisor.id,
                                assignedToId: techUsers[i % 20].id,
                            }
                        })];
                case 41:
                    _a.sent();
                    _a.label = 42;
                case 42:
                    i++;
                    return [3 /*break*/, 39];
                case 43:
                    i = 1;
                    _a.label = 44;
                case 44:
                    if (!(i <= 150)) return [3 /*break*/, 48];
                    otNumber = "OT-HIST-".concat(i.toString().padStart(4, '0'));
                    return [4 /*yield*/, db.workOrder.findUnique({ where: { number: otNumber } })];
                case 45:
                    existing = _a.sent();
                    if (existing)
                        return [3 /*break*/, 47];
                    closedDate = new Date();
                    closedDate.setDate(closedDate.getDate() - Math.floor(Math.random() * 180));
                    startDate = new Date(closedDate);
                    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 5) - 1); // 1 a 5 días de duración
                    scheduledDate = new Date(startDate);
                    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 3));
                    isCorrective = Math.random() > 0.5;
                    actualHours = Math.floor(Math.random() * 20) + 2;
                    laborCost = actualHours * 50000;
                    partsCost = isCorrective ? Math.floor(Math.random() * 2000000) : Math.floor(Math.random() * 500000);
                    return [4 /*yield*/, db.workOrder.create({
                            data: {
                                organizationId: org.id,
                                number: otNumber,
                                title: "".concat(isCorrective ? 'Reparación de Falla' : 'Mantenimiento Programado', " - Hist\u00F3rico ").concat(i),
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
                                actualHours: actualHours,
                                laborCost: laborCost,
                                partsCost: partsCost,
                                totalCost: laborCost + partsCost,
                            }
                        })];
                case 46:
                    _a.sent();
                    _a.label = 47;
                case 47:
                    i++;
                    return [3 /*break*/, 44];
                case 48:
                    console.log('✅ Seed completado con éxito (50 Clientes, 100 Activos, 20 Técnicos, 10 Proyectos con Gantt, 30 Preventivas).');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(function () { return db.$disconnect(); });
