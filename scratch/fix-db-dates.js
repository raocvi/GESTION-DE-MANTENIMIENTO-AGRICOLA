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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var orders, updatedCount, _i, orders_1, o, updateData, baseDate, due, closedOrders, delayedCount, i, o, closedDate, newDue, activeOrders, activeUpdated, _a, activeOrders_1, o;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Iniciando corrección y enriquecimiento de fechas demo en la base de datos...");
                    return [4 /*yield*/, prisma.workOrder.findMany()];
                case 1:
                    orders = _b.sent();
                    console.log("Se encontraron ".concat(orders.length, " \u00F3rdenes de trabajo."));
                    updatedCount = 0;
                    _i = 0, orders_1 = orders;
                    _b.label = 2;
                case 2:
                    if (!(_i < orders_1.length)) return [3 /*break*/, 5];
                    o = orders_1[_i];
                    updateData = {};
                    // Si no tiene scheduledDate, asignarle la fecha de creación
                    if (!o.scheduledDate) {
                        updateData.scheduledDate = o.createdAt;
                    }
                    // Si no tiene dueDate, asignarle 2 días después de la fecha programada
                    if (!o.dueDate) {
                        baseDate = o.scheduledDate || o.createdAt;
                        due = new Date(baseDate);
                        due.setDate(due.getDate() + 2);
                        updateData.dueDate = due;
                    }
                    if (!(Object.keys(updateData).length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.workOrder.update({
                            where: { id: o.id },
                            data: updateData
                        })];
                case 3:
                    _b.sent();
                    updatedCount++;
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Se complet\u00F3 la primera fase. ".concat(updatedCount, " \u00F3rdenes actualizadas con fechas b\u00E1sicas."));
                    return [4 /*yield*/, prisma.workOrder.findMany({
                            where: { status: 'closed' }
                        })];
                case 6:
                    closedOrders = _b.sent();
                    delayedCount = 0;
                    i = 0;
                    _b.label = 7;
                case 7:
                    if (!(i < closedOrders.length)) return [3 /*break*/, 10];
                    o = closedOrders[i];
                    if (!(o.dueDate && o.closedAt)) return [3 /*break*/, 9];
                    if (!(Math.random() < 0.4)) return [3 /*break*/, 9];
                    closedDate = new Date(o.closedAt);
                    newDue = new Date(closedDate);
                    // La fecha límite fue de 1 a 5 días antes de cerrarse
                    newDue.setDate(closedDate.getDate() - (Math.floor(Math.random() * 5) + 1));
                    return [4 /*yield*/, prisma.workOrder.update({
                            where: { id: o.id },
                            data: { dueDate: newDue }
                        })];
                case 8:
                    _b.sent();
                    delayedCount++;
                    _b.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 7];
                case 10: return [4 /*yield*/, prisma.workOrder.findMany({
                        where: {
                            status: { notIn: ['closed', 'completed'] }
                        }
                    })];
                case 11:
                    activeOrders = _b.sent();
                    activeUpdated = 0;
                    _a = 0, activeOrders_1 = activeOrders;
                    _b.label = 12;
                case 12:
                    if (!(_a < activeOrders_1.length)) return [3 /*break*/, 15];
                    o = activeOrders_1[_a];
                    if (!(Math.random() < 0.15)) return [3 /*break*/, 14];
                    return [4 /*yield*/, prisma.workOrder.update({
                            where: { id: o.id },
                            data: { priority: 'critical' }
                        })];
                case 13:
                    _b.sent();
                    activeUpdated++;
                    _b.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 12];
                case 15:
                    console.log("Fase dos completada: ".concat(delayedCount, " \u00F3rdenes cerradas ahora simulan retrasos operativos."));
                    console.log("Fase tres completada: ".concat(activeUpdated, " \u00F3rdenes activas configuradas con prioridad CR\u00CDTICA."));
                    console.log("¡Enriquecimiento de datos demo completado exitosamente! 🚀");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("Error al ejecutar el script:", e);
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
