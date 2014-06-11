Floorplan = require './floorplan'
{loadJSONPAssets} = require './jsonploader'
{createImage, endsWith} = require './utils'

MYDECO_QUERY = "http://mydeco3d.com/ws/search/product?db=component&display=renders&display=surface_height&display=bounding_box&display=wall_mounted&display=level&display=model"
CDN = 'http://cdn.floorplanner.com/assets/'

module.exports.loadFloorPlan = (url, callback) ->
  getFloorplanFile url,callback

getFloorplanFile = (url, callback)->
#    console.log url
    xhr url, (result) ->
        if endsWith url, '.xml'
            parseString result, (err, res2) ->
                constructFloorplanFromFML res2, callback
        else if endsWith url, '.json'
            constructFloorplanFromRS JSON.parse result
    
xhr = (query, callback) ->
    req = new XMLHttpRequest()
    req.onreadystatechange = ->
        if req.readyState is 4 and req.status is 200
            callback req.responseText
    req.open 'GET', query, true
    req.send()

getJSON = (query, callback) ->
    xhr query, (result) ->
        obj = JSON.parse result
        callback obj

constructQuery = (components) ->
    query = MYDECO_QUERY
    if typeof components is 'object'
        for c in components
            query += "&id=" + c.component_id
    else query += "&id=" + components
    query

constructFloorplanFromRS = (rs) ->
    plan = {areas:[], walls:[]}
    rsplan = rs.model.plan
    for k,wall of rsplan.walls
        thickness = wall.thickness
        a = rsplan.points[wall.indices[0]]
        b = rsplan.points[wall.indices[1]]
        p1 = {x:parseInt(a[0]), y:parseInt(a[1]*-1)}
        p2 = {x:parseInt(b[0]), y:parseInt(b[1]*-1)}
        plan.walls.push {a:p1, b:p2, thickness:thickness+2}

    for k,area of plan.areas
        arr = []
        for pIndex in area.indices
            p = plan.points[pIndex]
            arr.push {x:p[0], y:p[1]*-1}
        plan.areas.push arr

      # query = constructQuery rs.model.components
      # onRSAssetsLoaded = () =>
      #   for k,v of PIXI.TextureCache
      #     console.log k,v
      #     sprite =  new PIXI.Sprite.fromImage(v)
      #     if sprite then console.log sprite
      #     console.log scene
      #     scene.assetContainer.addChild(sprite)

      # getJSON query, (data) ->
      #   urls = []
      #   for k, v of data.products when v isnt null
      #     urls.push v.renders[0].top
      #   loader = new PIXI.AssetLoader(urls, true)
      #   loader.onComplete = onRSAssetsLoaded
      #   loader.load()
    Floorplan.get().buildPlan plan

getFMLRoot = (fml) ->
    if fml.hasOwnProperty 'design' # the normal one
        return fml.design
    else if fml.hasOwnProperty 'project' # the portal one
        return fml.project.floors[0].floor[0].designs[0].design[0]

constructFloorplanFromFML = (fml, callback) ->
    MULTIPLIER = 100
    root = getFMLRoot fml
    lines = root.lines[0].line
    areas = root.areas[0].area
    assets = root.assets[0].asset
    objects = root.objects[0].object
    plan = {assets:[], areas:[], walls:[], curvedWalls:[],  items:[]}
  
    for area in areas
        outPoints = []
        pointGroup = area.points[0].split(',')
        console.log 'refid area '+area.asset?[0]['$']['refid']
        for pointPair in pointGroup
            [x1, y1, z1, x2, y2, z2] = pointPair.split(' ')
            outPoints.push {x:x1 * MULTIPLIER, y:y1 * MULTIPLIER}
            outPoints.push {x:x2 * MULTIPLIER, y:y2 * MULTIPLIER}
        plan.areas.push outPoints

    for line in lines
        if line.type[0] #is 'default_wall' #'normal_wall'
            # TODO: rename values
            values = (line.points[0].split(',')[0]).split(' ')
            if values.length is 6 # these lines aren't curved.
                [x1, y1, z1, x2, y2, z2] = values
                a = {x:parseInt(x1 * MULTIPLIER), y:parseInt(y1 * MULTIPLIER)}
                b = {x:parseInt(x2 * MULTIPLIER), y:parseInt(y2 * MULTIPLIER)}
                plan.walls.push {a:a, b:b, thickness:line.thickness[0] * MULTIPLIER}
            else if values.length is 9 #these lines are curved.
                [x1, y1, z1, x2, y2, z2, x3, y3, z3] = values
                a = {x:parseInt(x1 * MULTIPLIER), y:parseInt(y1 * MULTIPLIER)}
                b = {x:parseInt(x2 * MULTIPLIER), y:parseInt(y2 * MULTIPLIER)}
                c = {x:parseInt(x3 * MULTIPLIER), y:parseInt(y3 * MULTIPLIER)}
                plan.curvedWalls.push
                    start:a, end:b, control:c,
                    thickness:line.thickness[0] * MULTIPLIER
        else
            console.log "#{line.type[0]} not drawn."
            console.log line.points[0]

    if objects
        for object in objects
            data =
                id:object.asset?[0]['$']['refid']
                type:object.type?[0]
                mirrored:object.mirrored?[0].split(' ') or [0, 0,0]
                points:object.points?[0].split(' ')
                rotation:object.rotation?[0].split(' ')
                size:object.size?[0].split(' ')
              
            x = parseInt(data.points?[0] * MULTIPLIER)
            y = parseInt(data.points?[1] * MULTIPLIER)
            width = parseInt(data.size?[0] * MULTIPLIER) or 0
            height = parseInt(data.size?[1] * MULTIPLIER) or 0
            rotation = parseInt(data.rotation?[2]) or 0
            mirrored = [ parseInt(data.mirrored?[0]),
                         parseInt(data.mirrored?[1]),
                         parseInt(data.mirrored?[2])] or [0, 0, 0]

            item =
                x:x, y:y, width:width, height:height, rotation:rotation,
                type:data.type, assetID:data.id

            plan.items.push item

    assetURLS = []
    if assets
        for asset in assets
            if endsWith asset.url2d[0], 'flz'
                url = CDN + asset.url2d[0]
                    .replace('flz/', 'jsonp'+'/')
                    .replace('.flz', '.jsonp')
        plan.assets.push url
    else
        console.log "not handling file #{asset.url2d[0]} yet"

    console.log 'plan is: ',plan
    console.log "lines: #{lines.length}, areas: #{areas.length}"
    callback plan

