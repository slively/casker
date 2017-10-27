"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
exports.registeredTasks = new Map();
var Task = (function () {
    function Task(name, cmd, cwd, env, isLongRunning, description, dependsOn, onExit) {
        if (env === void 0) { env = {}; }
        if (isLongRunning === void 0) { isLongRunning = false; }
        if (description === void 0) { description = ''; }
        this.name = name;
        this.cmd = cmd;
        this.cwd = cwd;
        this.env = env;
        this.isLongRunning = isLongRunning;
        this.description = description;
        this.dependsOn = dependsOn;
        this.onExit = onExit;
    }
    return Task;
}());
exports.Task = Task;
var Tasks = (function () {
    function Tasks(name, description, tasks, isParallel) {
        if (description === void 0) { description = ''; }
        if (tasks === void 0) { tasks = []; }
        if (isParallel === void 0) { isParallel = true; }
        this.name = name;
        this.description = description;
        this.tasks = tasks;
        this.isParallel = isParallel;
    }
    return Tasks;
}());
exports.Tasks = Tasks;
var TaskBuilder = (function () {
    function TaskBuilder(namespace, cwd) {
        if (namespace === void 0) { namespace = ''; }
        if (cwd === void 0) { cwd = process.cwd(); }
        var _this = this;
        this.namespace = namespace;
        this.cwd = cwd;
        this.tasksParallel = function (name) {
            var tasks = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                tasks[_i - 1] = arguments[_i];
            }
            return _this.tasks(name, tasks, true);
        };
        this.tasksSeries = function (name) {
            var tasks = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                tasks[_i - 1] = arguments[_i];
            }
            return _this.tasks(name, tasks, false);
        };
        this.task = function (name, cmd, options) {
            if (options === void 0) { options = {}; }
            var env = options.env, isLongRunning = options.isLongRunning, description = options.description, dependsOn = options.dependsOn, onExit = options.onExit;
            var t = new Task("" + (_this.namespace.length ? _this.namespace + ":" : '') + name, cmd, _this.cwd, env, isLongRunning, description, dependsOn, onExit);
            _this.registerTask(t);
            return t;
        };
    }
    TaskBuilder.prototype.tasks = function (name, tasks, isParallel) {
        var t = new Tasks(name, undefined, tasks, isParallel);
        this.registerTask(t);
        return t;
    };
    // TODO: check for cycles
    TaskBuilder.prototype.registerTask = function (t) {
        if (exports.registeredTasks.get(t.name)) {
            logger_1.logger.error(new Error("Task already exists with name '" + t.name + "'."));
            process.exit(1);
        }
        exports.registeredTasks.set(t.name, t);
        return t;
    };
    return TaskBuilder;
}());
exports.TaskBuilder = TaskBuilder;
exports.builder = function (options) {
    if (options === void 0) { options = {}; }
    var namespace = options.namespace, cwd = options.cwd;
    return new TaskBuilder(namespace, cwd);
};
//# sourceMappingURL=builder.js.map