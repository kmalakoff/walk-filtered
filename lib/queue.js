var bind = function(fn, me) {
  return function() {
    return fn.apply(me, arguments);
  };
};

function Queue(parallelism) {
  this.parallelism = parallelism;
  this._doneTask = bind(this._doneTask, this);
  this.parallelism || (this.parallelism = Infinity);
  this.tasks = [];
  this.running_count = 0;
  this.error = null;
  this.await_callback = null;
}

Queue.prototype.defer = function(callback) {
  this.tasks.push(callback);
  return this._runTasks();
};

Queue.prototype.await = function(callback) {
  if (this.await_callback) {
    throw new Error('Awaiting callback was added twice: ' + callback);
  }
  this.await_callback = callback;
  if (this.error || !(this.tasks.length + this.running_count)) {
    return this._callAwaiting();
  }
};

Queue.prototype._doneTask = function(err) {
  this.running_count--;
  this.error || (this.error = err);
  return this._runTasks();
};

Queue.prototype._runTasks = function() {
  var current;
  if (this.error || !(this.tasks.length + this.running_count)) {
    return this._callAwaiting();
  }
  while (this.running_count < this.parallelism) {
    if (!this.tasks.length) {
      return;
    }
    current = this.tasks.shift();
    this.running_count++;
    current(this._doneTask);
  }
};

Queue.prototype._callAwaiting = function() {
  if (this.await_called || !this.await_callback) {
    return;
  }
  this.await_called = true;
  return this.await_callback(this.error);
};

module.exports = Queue;
