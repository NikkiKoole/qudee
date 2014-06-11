
isUnit = (value) ->
    (0 <= value <= 1.0)
  
module.exports = class View extends PIXI.DisplayObjectContainer
    constructor: (x,y,width, height)->
        super()
        @vp = {x:x, y:y, width:width, height:height}
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

    getMask: ->
        scale = @getScale()
        mask = new PIXI.Graphics()
        mask.beginFill 0xffffff
        mask.drawRect(@vp.x * @width, @vp.y * @height, @width * scale, @height * scale)
        mask.endFill()
        mask

    
    render: (world) =>
        scale = @getScale()
        @graphics.clear()
        @graphics.beginFill 0xffffff * Math.random()
        @graphics.drawRect(@vp.x* @width, @vp.y * @height, @width*scale, @height*scale)
        
        #console.log @vp.x* @width, @vp.y * @height
        
        w =  world.render(@graphics,
          -(@cx - @width/2),
          -(@cy - @height/2),
          scale)
        
        @graphics.addChild w
        @graphics.endFill()
        #@graphics.mask = @getMask()
        #@graphics.addChild @getMask()
        #@addChild(@graphics.mask)
        @addChild(@graphics)
        return
