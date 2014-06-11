
class WallCorner
    constructor: (@x, @y)->
        @edges = []
    addEdge : (edge) ->
        @edges.push edge
    getAdjacent: (fromEdge) ->
        (edge for edge in @edges when fromEdge isnt edge)

class WallEdge
    constructor : (@corner1, @corner2, @thickness) ->
    getOther : (corner) ->
        if corner.x is @corner1.x and corner.y is @corner1.y then return @corner2
        if corner.x is @corner2.x and corner.y is @corner2.y then return @corner1
    
module.exports = class WallGraph
    constructor : ->
        @_cornerMap = {}

    getCorners : ->
        v for k, v of @_cornerMap

    addWall: (p1, p2, thickness) ->
        corner1 = @_addCorner(p1.x, p1.y)
        corner2 = @_addCorner(p2.x, p2.y)
        edge = new WallEdge(corner1, corner2, thickness)
        corner1.addEdge edge
        corner2.addEdge edge

    _addCorner: (x, y) ->
        if @_cornerMap["#{x},#{y}"]
            return @_cornerMap["#{x},#{y}"]
        else
            @_cornerMap["#{x},#{y}"] = new WallCorner(x,y)
            return @_cornerMap["#{x},#{y}"]


