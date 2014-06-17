module.exports = class AreaLayer extends PIXI.Graphics
    constructor: ->
        super()
    
    render:  (areas) ->
        for area in areas
            @beginFill 0xffff00#color
            @lineStyle 0, 0x000000
            for p in area
                @lineTo(p.x, p.y)
            @endFill()
        return
