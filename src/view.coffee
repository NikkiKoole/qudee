
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
  render: (world) =>
    #does a lot, get data from world and when I see it, i construct it in my view.
    #create a yellow backdrop
    w = window.innerWidth
    h = window.innerHeight
    @graphics.clear()
    @graphics.beginFill 0xffff00
    vpScaleX = (@vp.width*w)/@width
    vpScaleY = (@vp.height*h)/@height
    #draw world here
    # this function returns a child I can add
    w =  world.render(@graphics,
      -(@cx - @width/2),
      -(@cy - @height/2),
      vpScaleX, vpScaleY)
    @graphics.addChild w
    @graphics.endFill()
    @addChild(@graphics)
