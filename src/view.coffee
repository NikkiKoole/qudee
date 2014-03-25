
isUnit = (value) ->
  (0 <= value <= 1.0)
  
module.exports = class View extends PIXI.DisplayObjectContainer
  constructor: ->
    super()
    @vp = {x:0, y:0, width:1, height:1}
    @graphics = new PIXI.Graphics()

  setSize: (@width, @height) ->

  setCenter: (@cx, @cy) ->

  move: (x, y) ->
    @cx += x
    @cy += y

  setViewport: (x, y, width, height) ->
    if (not isUnit x) or (not isUnit y) or (not isUnit width) or (not isUnit height)
      throw Error 'setViewport only accepts float values between 0 and 1.'
    @vp ={x:x, y:y, width:width, height:height}
  getScale: ->
    vpScaleX = (@vp.width*window.innerWidth)/@width
    vpScaleY = (@vp.height*window.innerHeight)/@height
    scale = Math.min vpScaleX, vpScaleY

   
  render: (world) =>
    scale = @getScale()
    @graphics.clear()
    @graphics.beginFill 0xffff00
     #console.log vpScaleX, vpScaleY
    w =  world.render(@graphics,
      -(@cx - @width/2),
      -(@cy - @height/2),
      scale)
    @graphics.addChild w
    @graphics.endFill()
    @addChild(@graphics)
    return
