module.exports = class AreaLayer

    @render: (areas, graphics, x, y, scale, color) ->
        for area in areas
            graphics.beginFill color
            graphics.lineStyle 0, 0x000000
            for p in area
                graphics.lineTo((p.x+x)*scale, (p.y+y)*scale)
            graphics.endFill()
        return
