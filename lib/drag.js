var Emitter = require('component-emitter')
  , defaults = require('lodash.defaults')

var defaultOpts = {}

module.exports = Drag

function Drag(phys, opts, start) {
  var handles

  this._phys = phys
  if(typeof opts === 'function') {
    this._startFn = opts
    opts = {}
  } else {
    this._startFn = start
  }

  this._opts = defaults({}, defaultOpts, opts)
  handles = this._opts.handle

  if(handles && !handles.length) {
    handles = [handles]
  } else if(handles && handles.length) {
    handles = [].slice.call(handles)
  } else {
    handles = phys.els
  }
  handles.forEach(this._setupHandle, this)
}

Emitter(Drag.prototype)

Drag.prototype.moved = function() {
  return this._moved
}

Drag.prototype._setupHandle = function(el) {
  //start events
  el.addEventListener('touchstart', this._start.bind(this))
  el.addEventListener('mousedown', this._start.bind(this))

  //move events
  el.addEventListener('touchmove', this._move.bind(this))
  //apply the move event to the window, so it keeps moving,
  //event if the handle doesn't
  window.addEventListener('mousemove', this._move.bind(this))

  //end events
  el.addEventListener('touchend', this._end.bind(this))
  window.addEventListener('mouseup', this._end.bind(this))
}

Drag.prototype._start = function(evt) {
  this._mousedown = true
  this._moved = false
  this._interaction = this._phys.interact({
    boundry: this._opts.boundry,
    damping: this._opts.damping
  })
  var promise = this._interaction.start(evt)
  this._startFn && this._startFn(promise)
  this.emit('start', evt)
}

Drag.prototype._move = function(evt) {
  if(!this._mousedown) return
  this._moved = true

  evt.preventDefault()
  this._interaction.update(evt)
  this.emit('move', evt)
}

Drag.prototype._end = function(evt) {
  if(!this._mousedown) return

  this._mousedown = false

  this._interaction.end()
  this.emit('end', evt)
}